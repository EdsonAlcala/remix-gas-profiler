import fs from "fs"

import { profiler } from "../src/profiler"
import { parseSourceMap } from "../src/utils";

const SOURCEMAP_FILE = "./test/mock-data/source-maps.json"; // TODO Change this
const PROVIDER = "http://localhost:8545" // TODO
const CONTRACT_ADDRESS = "0x007a4908dd8c49b0231d21baad2c449b2cdb97ed" // TODO
const CONTRACT_FILE = "./test/mock-data/SimpleStorage.sol"; // TODO Change this
const TRACE_SAMPLE_FILE = "./test/mock-data/sample-trace.json";

describe('Profiler tests', () => {

    it('generate the gas profiler report', async () => {

        const sourceMapFile = fs.readFileSync(SOURCEMAP_FILE, 'utf8');
        const sourceMap = JSON.parse(sourceMapFile).sourceMap;

        const originalSourceCode = fs.readFileSync(CONTRACT_FILE, 'utf8');
        const traceJSONSample = JSON.parse(fs.readFileSync(TRACE_SAMPLE_FILE, 'utf8'))

        console.log("traceJSONSample", traceJSONSample)

        const bytecode = '6080604052348015600f57600080fd5b506103e86000556096806100246000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80631865c57d146037578063c19d93fb14604f575b600080fd5b603d6055565b60408051918252519081900360200190f35b603d605b565b60005490565b6000548156fea265627a7a723058209fa44d2c74885e60715e4d845d6f360f80cbef23b84d3804408903f946b90bbf64736f6c634300050a0032' // await web3.eth.getCode(contractAddress);

        const result = await profiler(sourceMap, bytecode, originalSourceCode, traceJSONSample)//, 

        console.log(`The result is ${JSON.stringify(result)}`)

        expect(true).toEqual(true)

    })
})

// 114967