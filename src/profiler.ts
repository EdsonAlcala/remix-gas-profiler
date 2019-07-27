// import Web3 from "web3"

import { buildLineOffsets, buildPcToInstructionMapping, parseSourceMap } from './utils';

const binarysearch = require('binarysearch');

const TX_HASH = "0x8a41f3dfc9b5a9469ff0bcaca825df4f8dd22789d0d4a4ad78917d46adf8328e" // TODO

interface SourceMap {
    [key: number]: any
}

export const profiler = async (sourceMap: string, originalSourceCode: string, trace: any, providerURL: string, contractAddress: string) => {
    try {
        // const provider = new Web3.providers.HttpProvider(providerURL);
        // const web3 = new Web3(provider);

        console.log("sourceMap", sourceMap)
        console.log("providerURL", providerURL)
        console.log("contractAddress", contractAddress)

        const sourceMapParsed = parseSourceMap(sourceMap);
        const code = "0x6080604052348015600f57600080fd5b506103e86000556096806100246000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80631865c57d146037578063c19d93fb14604f575b600080fd5b603d6055565b60408051918252519081900360200190f35b603d605b565b60005490565b6000548156fea265627a7a723058209fa44d2c74885e60715e4d845d6f360f80cbef23b84d3804408903f946b90bbf64736f6c634300050a0032"// await web3.eth.getCode(contractAddress);
        console.log("Code", code)

        const pcToIdx = buildPcToInstructionMapping(code);
        console.log("pcToIdx", pcToIdx)

        const lineOffsets = buildLineOffsets(originalSourceCode); // To Know the lenght per line 
        console.log("lineOffsets", lineOffsets)

        const lineGas: any[] = [];

        let synthCost = 0;

        console.log("trace", trace)

        const bottomDepth = trace.structLogs[0].depth; // should be 1

        console.log("bottomDepth", bottomDepth)
        console.log("trace.structLogs.length", trace.structLogs.length)

        for (let i = 0; i < trace.structLogs.length;) {
            const { depth, error, gas, gasCost, op, pc, stack } = trace.structLogs[i];
            console.log("gas", gas)
            console.log("gasCost", gasCost)
            console.log("op", op)
            console.log("pc", pc)

            let cost;
            if (['CALL', 'CALLCODE', 'DELEGATECALL', 'STATICCALL'].includes(op)) {
                // for call instruction, gasCost is 63/64*gas, not real gas cost
                const gasBeforeCall = gas;
                do {
                    i += 1;
                } while (trace.structLogs[i].depth > bottomDepth);
                cost = gasBeforeCall - trace.structLogs[i].gas;
            } else {
                i += 1;
                cost = gasCost;
            }

            console.log("COST", cost)

            const instructionIdx = pcToIdx[pc];
            console.log("instructionIdx", instructionIdx)

            const { s, l, f, j } = sourceMapParsed[instructionIdx];
            if (f === -1) {
                synthCost += cost;
                continue;
            }
            const line = binarysearch.closest(lineOffsets, s);
            if (lineGas[line] === undefined) {
                lineGas[line] = cost;
            } else {
                lineGas[line] += cost;
            }
            console.log("line", line)
        } // for 

        originalSourceCode.split('\n').forEach((line, i) => {
            const gas = lineGas[i] || 0;
            console.log('%s\t\t%s', gas, line);
        });

        console.log('synthetic instruction gas', synthCost);

    } catch (error) {
        console.log("ERROR", error)
    }
}

// Also make the conversion to solcoverage.json

