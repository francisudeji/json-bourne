import * as Bun from "bun";
import { Lexer } from "./lexer";

const FILE_PATH = "./packages.json";

const file = Bun.file(FILE_PATH);

if (!(await file.exists())) {
  console.error(`ERROR: Failed to read file path: ${FILE_PATH}. Try again`);
  process.exit(1);
}

const content = await file.text();
const lexer = new Lexer(content);

while (true) {
  const token = lexer.nextToken();
  if (!token || token.kind === "EOF") break;
  console.log(token);
}
