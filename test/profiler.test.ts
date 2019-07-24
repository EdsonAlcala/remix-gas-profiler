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

        const result = await profiler(sourceMap, originalSourceCode, traceJSONSample, PROVIDER, CONTRACT_ADDRESS);

        console.log(`The result is ${JSON.stringify(result)}`)

        expect(true).toEqual(true)

    })
})

// 114967