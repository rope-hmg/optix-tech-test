// An type that represents the possibility of absence.
export interface Option<T> {
    unwrapOrElse(orElse: () => T): T;
}

class Some<T> implements Option<T> {
    public readonly isSome: true = true;
    public readonly isNone: false = false;

    constructor(public value: T) {}

    unwrapOrElse(_orElse: () => T): T {
        return this.value;
    }
}

class None<T> implements Option<T> {
    public readonly isSome: true = true;
    public readonly isNone: false = false;

    unwrapOrElse(orElse: () => T): T {
        return orElse();
    }
}

export function some<T>(value: T): Option<T> {
    return new Some(value);
}

export function none<T>(): Option<T> {
    return new None();
}

export function optionFromTruthyValue<T>(value?: T | null): Option<T> {
    return !!value
        ? some(value)
        : none();
}
