import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={1204}
    height={2019}
    fill="none"
    {...props}
  >
    <path
      fill="url(#a)"
      d="M1204 1009.5c0 557.53-269.525 1009.5-602 1009.5S0 1567.03 0 1009.5C0 451.969 269.525 0 602 0s602 451.969 602 1009.5Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={1204}
        x2={529.5}
        y1={1009}
        y2={1009}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#E1E1E1" />
        <stop offset={0.5} stopColor="#F5F5F0" />
        <stop offset={1} stopColor="#ffFfff" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgComponent;
