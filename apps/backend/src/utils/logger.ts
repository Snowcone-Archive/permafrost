import { blue, bold, dim, gray, green, red, yellow } from "yoctocolors";

export function success(...args: any[]) {
  console.log(green(bold("[+]")), ...args);
}

export function info(...args: any[]) {
  console.log(blue(bold("[@]")), ...args);
}

export function debug(...args: any[]) {
  console.log(gray(bold("[#]")), dim(args.join(" ")));
}

export function warn(...args: any[]) {
  console.warn(yellow(bold("[!]")), ...args);
}

export function error(...args: any[]) {
  console.error(red(bold("[X]")), ...args);
}
