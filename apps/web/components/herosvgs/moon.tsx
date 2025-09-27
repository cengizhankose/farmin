import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={120}
    height={120}
    fill="none"
    {...props}
  >
    <circle cx={45} cy={45} r={45} fill="#0E0E0E" />
  </svg>
);
export default SvgComponent;
