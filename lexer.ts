const TokenKind = {
  TOKEN_OBJECT_START: "TOKEN_OBJECT_START",
  TOKEN_OBJECT_END: "TOKEN_OBJECT_END",
  TOKEN_ARRAY_START: "TOKEN_ARRAY_START",
  TOKEN_ARRAY_END: "TOKEN_ARRAY_END",
  TOKEN_COMMA: "TOKEN_COMMA",
  TOKEN_COLON: "TOKEN_COLON",
  TOKEN_STRING_LITERAL: "TOKEN_STRING_LITERAL",
  TOKEN_NUMBER_LITERAL: "TOKEN_NUMBER_LITERAL",
  TOKEN_BOOLEAN: "TOKEN_BOOLEAN",
  TOKEN_NULL: "TOKEN_NULL",
  EOF: "EOF",
  TOKEN_ILLEGAL: "TOKEN_ILLEGAL",
};

type Token = {
  kind: keyof typeof TokenKind;
  literal: string;
};

export class Lexer {
  private content: string;
  private char: string;
  private cursor: number;
  private nextCursor: number;

  constructor(content: string) {
    this.content = content;

    this.cursor = 0;
    this.nextCursor = this.cursor + 1;
    this.char = content[this.cursor] ?? "";

    return this;
  }

  private chopChar() {
    if (this.nextCursor >= this.content.length) {
      this.char = TokenKind.EOF;
    } else {
      this.char = this.content[this.nextCursor]!;
    }

    this.cursor = this.nextCursor;
    this.nextCursor += 1;
  }

  private isLetter(char: string) {
    return ("a" <= char && char <= "z") || ("A" <= char && char <= "Z");
  }

  private isDigit(char: string): boolean {
    return "0" <= char && char <= "9";
  }

  private peekChar() {
    if (this.nextCursor >= this.content.length) {
      return 0;
    } else {
      return this.content[this.nextCursor];
    }
  }

  private removeWhitespace() {
    while (
      this.char === " " ||
      this.char === "\t" ||
      this.char === "\n" ||
      this.char === "\r"
    ) {
      this.chopChar();
    }
  }

  public nextToken(): Token | null {
    let token: Token | null = null;

    this.removeWhitespace();

    switch (this.char) {
      case "{":
        token = { kind: "TOKEN_OBJECT_START", literal: this.char };
        break;

      case "}":
        token = { kind: "TOKEN_OBJECT_END", literal: this.char };
        break;

      case ":":
        token = { kind: "TOKEN_COLON", literal: this.char };
        break;
      case ",":
        token = { kind: "TOKEN_COMMA", literal: this.char };
        break;

      case "[":
        token = { kind: "TOKEN_ARRAY_START", literal: this.char };
        break;

      case "]":
        token = { kind: "TOKEN_ARRAY_END", literal: this.char };
        break;

      case "EOF":
        token = { kind: "EOF", literal: "EOF" };
        break;

      case '"':
        {
          const from = this.nextCursor;
          this.chopChar();

          while (this.char !== '"') {
            if (this.char === "\\" && this.peekChar() === '"') {
              this.chopChar();
              this.chopChar();
            } else {
              this.chopChar();
            }
          }
          const literal = this.content
            .slice(from, this.cursor)
            .replaceAll(/\\"/gi, "'");

          token = {
            kind: "TOKEN_STRING_LITERAL",
            literal: literal,
          };
        }
        break;

      default:
        if (this.isLetter(this.char)) {
          const start = this.cursor;

          while (this.isLetter(this.char)) {
            this.chopChar();
          }
          const literal = this.content.slice(start, this.cursor);

          if (literal === "true" || literal === "false") {
            token = { kind: "TOKEN_BOOLEAN", literal };
          } else if (literal === "null") {
            token = { kind: "TOKEN_NULL", literal };
          }
        } else if (this.isDigit(this.char)) {
          const start = this.cursor;

          while (this.isDigit(this.char) || this.char === ".") {
            this.chopChar();
          }

          const literal = this.content.slice(start, this.cursor);
          token = {
            kind: "TOKEN_NUMBER_LITERAL",
            literal,
          };
          this.nextCursor = this.cursor;
        } else {
          token = { kind: "TOKEN_ILLEGAL", literal: this.char };
        }
    }

    this.chopChar();
    return token;
  }
}
