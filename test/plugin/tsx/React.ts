// simplified test implementation of React.createElement
export const createElement = (type: string, props: Array<any>, children: string[]) => {
    return type + ' with children: ' + children;
}