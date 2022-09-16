
process.env.PELIAS_CONFIG='./pelias.json';

const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
_.str = require("underscore.string");
const ParallelRequest = require('parallel-http-request');
const wdlevenshtein = require('weighted-damerau-levenshtein');
const AddressParser = require('pelias-parser/parser/AddressParser');

const apiApp = require('pelias-api/app');

const {serviceName, version, config, cors} = require('../base');

const app = express();

app.use(cors);

console.log(`Starting ${serviceName}...`);
console.log("Config:\n", config);

app.use(bodyParser.json());

const formatters = require('./formatters')(config);
const api = require('./api')(config);

//ranking algorithm
function textDistance(text, result) {
	//return _.str.levenshtein(text, hit._source.name.default)
	/*//https://github.com/mrshu/node-weighted-damerau-levenshtein/blob/master/index.js#L19
	insWeight : 1;
	delWeight : 1;
	subWeight : 1;
	useDamerau : true;*/
	return wdlevenshtein(text, result, {insWeight:2, subWeight:0.5})
}

app.locals.parser = { address: new AddressParser() }
//HACK from pelias-parser/server/...

//TODO manage parameter lang for any requests
//
//TODO add support to param lang un endpoints urls
//
/*apiApp.use((req, res, next) => {
	console.log('[geocoder] request:', req.method, req.originalUrl);
	next();
});*/

app.get('/libpostal/parse', require('pelias-parser/server/routes/parse'))

app.get(/^\/placeholder(.*)$/,  (req, res)=> {

	res.json({})
});

app.get('/here', async(req, res) => {
	
	const response = await api.here(req.query.text);

	console.log('HERE api request', req.query.text, JSON.stringify(response,null,4))
	//res.json(response);
	res.json(formatters.here(response));
})


//ElasticSearch proxy
app.post(/^\/pelias(.*)$/, (req, res)=> {
	
	//console.clear();
	//console.log('ELASTIC REQUEST', JSON.stringify(req.body, null, 4))
	
	//
	//TODO HERE FILTER REVERSE GEOCODING
	//

	let musts = _.get(req.body, "query.bool.must");
	
	if (!musts || musts.length===0) {
		res.json( formatters.elasticsearch([]) );
		return false;
	}
	//UN USEFUL let q_search = _.get(req.body, "query.bool.must[0].match['name.default'].query");
	let texts = [],
		lang;

	_.forEach(musts, function(m, k) {
		
		//texts search
		let q1 = _.get(m, "constant_score.filter.multi_match.query");
		let q2 = _.get(m, "multi_match.query");
		texts.push(q1 || q2);

		if(!lang) {
			//word
			let ll = _.get(m, "constant_score.filter.multi_match.fields")
				, l1;
			if(_.isArray(ll)) {
				l1 = ll.pop();
				l1 = l1.split('.').pop();
			}
			//phrase
			let ll2 = _.get(m, "multi_match.fields")
				, l2;
			if(_.isArray(ll2)) {
				l2 = ll2.pop();
				l2 = l2.split('.').pop();
			}
			lang = l1 || l2 || config.default_lang;
		}
	});

	//let q = _.get(req.body, "query.bool.must[0].constant_score.filter.multi_match.query");
	//	let q2 = _.get(req.body, "query.bool.must[1].constant_score.filter.multi_match.query");

	let text = texts.join(' ');

	console.log('[geocoder] Pelias Search: "', text,'" lang:',lang);//JSON.stringify(req.body,null,2))

	//console.log('ELASTIC SEARCH: "'+text+'"')

	if(!_.isString(text) || text.length < Number(config.min_text_length)) {
		
		res.json( formatters.elasticsearch([]) )
	}
	else {
		combineResults(text, lang, jsonres => {
			
			jsonres = orderResult(text, jsonres)

			res.json(jsonres);

		});
	}
});

//DEBUG http://localhost:8087/testSearch?text=hotel
app.get('/testSearch', (req,res) => {
	
	console.log('[geocoder] /testSearch',req.query);

	let lang = req.query.lang || config.default_lang;
	
	if(!_.isEmpty(req.query.text)) {
		
		combineResults(req.query.text, lang, jsonres => {

			jsonres = orderResult(req.query.text, jsonres)

			res.json({
				rawResult: jsonres.hits.hits.map(hit => {
					return {
						name: hit._source.name.default,
						//layer: hit._source.layer,
						rank: textDistance(req.query.text, hit._source.name.default)
					}
				}),
				peliasResult: jsonres
			});
		});
	}
});

const serverParser = app.listen(config.pelias_listen_port, () => {
	console.log('[geocoder-pelias-services] listening on %s:%s', config.pelias_listen_port)
	process.on('SIGTERM', () => {
		console.error('[geocoder-pelias-services] closing...')
		serverParser.close();
	});
});

//TODO
/*apiApp.get(['/',/geocoder'], async (req, res) => {
  res.send({
    status: 'OK',
    version
  });
});*/

const serverApi = apiApp.listen( config.listen_port, function() {
  console.log( apiApp._router.stack.filter(r => r.route).map(r => `${Object.keys(r.route.methods)[0]} ${r.route.path}`) );
  console.log(`${serviceName} listening at http://localhost:${this.address().port}`);
	process.on('SIGTERM', () => {
		console.error('[geocoder] closing...')
		serverApi.close();
	});
});

function orderResult(text, res) {
	res.hits.hits = _.sortBy(res.hits.hits, hit => {
		return textDistance(text, hit._source.name.default)
	});
	return res;
}

function tmpl(str, data) {
	const tmplReg = /\{\{([\w_\-]+)\}\}/g
	return str.replace(tmplReg, function (str, key) {
		let value = data[key];
		if (value === undefined)
			value = '';
		return value;
	}); 
}

function makeUrl(opt, text, lang) {
	let prot = 'http'+(opt.port===443?'s':'');
	let host = prot+'://' + opt.hostname;
	let port = (opt.port!=80 && opt.port!=443)? (':'+opt.port) : '';
	let url = tmpl(host + port + opt.path, {
		text: encodeURI(text),
		//text: text,
		size: opt.size,
		lang: lang || config.default_lang
	});
	return url;
}


function combineResults(text, lang, cb) {

	cb = cb || _.noop;

	lang = lang || config.default_lang

	//docs https://github.com/aalfiann/parallel-http-request
	var request = new ParallelRequest();

	_.forOwn(config.endpoints, (eOpt, eKey) => {

		if(eKey==='here') return;

		request.add({
			id: eKey,	//not required by ParallelRequest
			url: makeUrl(eOpt, text, lang),
			method: eOpt.method,
			headers: eOpt.headers
		});
	});

	var requests = request.getCollection();

	console.log(`[geocoder] search: "${text}" parallel remote requests...`);

	request.send( resp => {

		let results = [], i = 0;

		requests.forEach( req => {

			console.log('[geocoder] request',req.url)
			
			if(_.isFunction(formatters[ req.id ])) {

				let response = resp[i++];

				let eRes = formatters[ req.id ]( response.body, lang );
			
				console.log(`[geocoder] response Endpoint: '${req.id}' results`, _.size(eRes));

				results.push(eRes);
			}
		});

		results = _.flatten(results);

		if (config.endpoints.here) {
			(async (cbb, poiResults) => {		//prepend here results
				const hereResponse = await api.here(text, lang);
				const hereResults = formatters.here(hereResponse);

				console.log(`[geocoder] response Endpoint: 'HERE' results`, _.size(hereResults));
				//console.log(JSON.stringify(_.get(hereResponse,'body.Response.View[0].Result'),null,4));

				//add here first
				const returnResults = hereResults.concat(poiResults);

				cbb( formatters.elasticsearch(returnResults) );

			})(cb, results);
		}
		else {
			cb(formatters.elasticsearch(results));
		}
	});
}
