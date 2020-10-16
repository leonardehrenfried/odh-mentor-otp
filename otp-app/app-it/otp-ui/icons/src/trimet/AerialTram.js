import React from "react";

const SvgAerialtram = ({ title, ...props }) => (
  <svg viewBox="0 0 390 390" {...props}>
    {title ? <title>{title}</title> : null}
    <path d="M277.9 206.4c-15.8-5.3-54.8-8.6-74.4-10v-87.9L318.2 150v-15.3l-71.6-25.9V96.9L143.1 59.7v11.9L71.7 46.5v15.2L182 100.8v94.7l-43-.7s-34.9 3.6-55.5 27.8S62 261.1 62 275.4s11.6 38.5 29.6 48.4c17.9 9.8 40.3 11.6 40.3 11.6l95.8 8.1s45.7-1.3 66.3-13.4c15.2-9 34-23.3 34-58.2 0-35-23.8-56.7-50.1-65.5zm-134.4 84.2H84.4s-7.2-26 2.7-42.1 18.8-22.4 18.8-22.4l37.6.9v63.6zm78 0h-57.3V227h57.3v63.6zm86.8 0h-66.1V227h44.6s9 5.4 18.8 21.5c9.9 16.1 2.7 42.1 2.7 42.1z" />
  </svg>
);

export default SvgAerialtram;
