import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { PrimitiveAtom } from 'jotai/vanilla';

type AtomFactory<TParam, TValue> = (param: TParam) => PrimitiveAtom<TValue>;

export function useParamAtom<TParam, TValue>(
    atomFactory: AtomFactory<TParam, TValue>,
    param: TParam
): TValue {
    const memoizedAtom = useMemo(
        () => atomFactory(param),
        [atomFactory, param]
    );
    return useAtomValue(memoizedAtom);
}
