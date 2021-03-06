#![allow(warnings)]

use std::collections::HashMap;

type Object = HashMap<String, Item>;

#[derive(Debug)]
enum Item {
    number(i32),
    string(String),
    object(Object),
}

#[derive(Debug)]
struct TypeParsed<'a, ResultType> {
    parsed: bool,
    value: Option<ResultType>,
    reason: Option<&'a str>,
}

const GENERIC_TYPE_PARSE_ERROR: TypeParsed<()> = TypeParsed {
    parsed: false,
    value: None,
    reason: Some("Can't parse this type"),
};

fn error<'a, T>(reason: &'a str) -> TypeParsed<T> {
    TypeParsed {
        parsed: false,
        value: None,
        reason: Some(reason),
    }
}

trait Parser<T> {
    fn parse(&self) -> TypeParsed<T>;
}

impl Parser for i32 {
    type Item = i32;
    fn parse(&self) -> TypeParsed<i32> {
        match self {
            0 => error("Can't be 0"),
            _ => TypeParsed {
                parsed: true,
                value: Some(*self),
                reason: None,
            },
        }
    }
}

fn main() {
    let dog = 1.parse();
    println!("{:?}", dog);
}
