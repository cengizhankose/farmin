import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={856}
    height={24}
    fill="none"
    {...props}
  >
    <path fill="#000" d="M0 0h856v24H0z" />
  </svg>
);
export default SvgComponent;
