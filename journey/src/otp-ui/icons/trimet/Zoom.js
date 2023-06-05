// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from "react";

const SvgZoom = ({ title, ...props }) => (
  <svg viewBox="0 0 390 390" {...props}>
    {title ? <title>{title}</title> : null}
    <path d="M319.5 124.5C319.5 55.9 263.7 0 195 0S70.5 55.9 70.5 124.5c0 63.7 48.2 116.5 110 123.7l-.1 141.8h29.3l-.1-141.8c61.8-7.2 109.9-59.9 109.9-123.7zM195 223.9c-54.8 0-99.4-44.6-99.4-99.4s44.6-99.4 99.4-99.4 99.4 44.6 99.4 99.4-44.6 99.4-99.4 99.4z" />
    <path d="M262.2 112.9h-55.7V57.2c0-6.3-5.2-11.5-11.5-11.5s-11.5 5.2-11.5 11.5v55.7h-55.7c-6.3 0-11.5 5.2-11.5 11.5s5.2 11.5 11.5 11.5h55.7v55.7c0 6.3 5.2 11.5 11.5 11.5s11.5-5.2 11.5-11.5v-55.7h55.7c6.3 0 11.5-5.2 11.5-11.5s-5.2-11.5-11.5-11.5z" />
  </svg>
);

export default SvgZoom;
