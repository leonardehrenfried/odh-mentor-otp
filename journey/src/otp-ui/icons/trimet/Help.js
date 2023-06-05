// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from "react";

const SvgHelp = ({ title, ...props }) => (
  <svg viewBox="0 0 390 390" {...props}>
    {title ? <title>{title}</title> : null}
    <path d="M195 20c46.7 0 90.7 18.2 123.7 51.3 33.1 33.1 51.3 77 51.3 123.7s-18.2 90.7-51.3 123.7c-33.1 33.1-77 51.3-123.7 51.3s-90.7-18.2-123.7-51.3C38.2 285.6 20 241.7 20 195s18.2-90.7 51.3-123.7c33-33.1 77-51.3 123.7-51.3m0-20C87.3 0 0 87.3 0 195s87.3 195 195 195 195-87.3 195-195S302.7 0 195 0z" />
    <path d="M228.2 315.8h-49.3v-47.6h49.3v47.6zm17.2-111.4c-14.5 10.5-20.6 16.9-20.6 41.2h-44.6c0-32.4 3.4-46.6 34.4-68.5 13.2-9.1 20.9-19.6 20.9-33.4 0-26.3-18.6-33.4-32.7-33.4-30.4 0-34.8 23-36.5 38.8v.3h-47.6c0-58.7 44.2-79 81-79 20.3 0 86.4 5.7 86.4 71.9.2 27.4-14.7 43.6-40.7 62.1z" />
  </svg>
);

export default SvgHelp;
