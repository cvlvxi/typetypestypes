// deno-lint-ignore-file  no-unused-vars
/********************************************************************************
 * TypeParser Version 2
/********************************************************************************
 */

type InputType<T> = string | T;

type TypeParsed<ResultType> = {
  parsed: boolean;
  value?: ResultType;
  reason?: string;
};

type TypeCallback<T> = (input: InputType<T>) => TypeParsed<T>;

type TypeCallbacks<T> = {
  [K in keyof T]: TypeCallback<T[K]>;
};


type TypeCollection<T> = {
  [K in keyof T]: { input: InputType<T>; callback: TypeCallback<T> };
};

type TypeResults<T> = {
  [K in keyof T]: TypeParsed<T[K]>;
};


class Parser {
  static GENERIC_TYPE_PARSE_ERROR = {
    parsed: false,
    reason: "Can't parse this type",
  };

  static NO_CALLBACK_FUNC_ERROR = {
    parsed: false,
    reason: "No associated callback parser function",
  };

  static ParseError = (reason: string) => {
    return { parsed: false, reason: reason };
  };


  static collect<T>(
    inputs: T,
    callbacks: TypeCallbacks<T>,
  ): TypeCollection<T> {
    type keyT = keyof T;
    const keyInputCallbackArray = (Object.keys(inputs) as Array<keyT>).map(
      (key) => {
        return [key, {
          input: inputs[key],
          callback: callbacks[key],
        }];
      },
    );
    return Object.fromEntries(
      keyInputCallbackArray,
    ) as unknown as TypeCollection<T>;
  }

  static string<T>(input: InputType<T>): TypeParsed<string> {
    if (typeof input === "string") {
      if (input.includes("dog")) {
        return { parsed: false, reason: "Must not contain dog" };
      }
      return { parsed: true, value: input };
    }
    return Parser.GENERIC_TYPE_PARSE_ERROR;
  }

  static number<T>(input: InputType<T>): TypeParsed<number> {
    let n: undefined | number | string = undefined;
    if (typeof input === "string") {
      n = Number(input);
      if (Number.isNaN(n)) return Parser.ParseError("Can't parse Parser string");
    } else if (typeof input === "number") {
      n = input;
    } else {
      return Parser.GENERIC_TYPE_PARSE_ERROR;
    }
    if (n === 0) {
      return Parser.ParseError("Number can't be 0");
    }
    return { parsed: true, value: n };
  }

  // static parseObject<T>(callbacks: TypeCallbacks<T>): TypeCallback<T> {
  static object<T>(callbacks: TypeCallbacks<T>) {
    return function (inputs: T): TypeResults<T> {
      const collection = Parser.collect(inputs, callbacks);
      const arr = (Object.keys(collection) as Array<keyof T>).map(
        (key) => {
          const { input, callback }: {
            input: InputType<T>;
            callback: TypeCallback<T>;
          } = collection[key];
          if (!callback) {
            return [key, Parser.NO_CALLBACK_FUNC_ERROR];
          }
          return [key, callback(input)];
        },
      );
      const obj = Object.fromEntries(arr);
      return obj;
    };
  }
}


let parser = Parser.object({
  dog: Parser.number,
  cat: Parser.string,
  obj: Parser.object({
    sup: Parser.number,
    chicken: Parser.number,
  }),
  horse: Parser.string,
  rat: Parser.string,
});

const results = parser({
  dog: "dog",
  cat: "hello",
  obj: {
    sup: 1,
    chicken: "100",
    eel: "hello"
  },
  yo: "meh",
  rat: "dog",
});

console.log(results);


/**
{
  dog: { parsed: false, reason: "Can't parse this string" },
  cat: { parsed: true, value: "hello" },
  obj: {
    sup: { parsed: true, value: 1 },
    chicken: { parsed: true, value: 100 },
    eel: { parsed: false, reason: "No associated callback parser function" }
  },
  yo: { parsed: false, reason: "No associated callback parser function" },
  rat: { parsed: false, reason: "Must not contain dog" }
}
 */
