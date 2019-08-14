import fs from "fs"

import { Profiler } from "../src/profiler"
import { parseSourceMap } from "../src/utils";

const SOURCEMAP_FILE = "./test/mock-data/source-maps.json"; // TODO Change this
const PROVIDER = "http://localhost:8545" // TODO
const CONTRACT_ADDRESS = "0x007a4908dd8c49b0231d21baad2c449b2cdb97ed" // TODO
const CONTRACT_FILE = "./test/mock-data/SimpleStorage.sol"; // TODO Change this
const TRACE_SAMPLE_FILE = "./test/mock-data/sample-trace.json";

const TRACE_SAMPLE_GANACHE_FILE = "./test/mock-data/sample-ganache-trace.json";
const TRACE_SAMPLE_GETH_FILE = "./test/mock-data/sample-geth-trace.json";
const TRACE_SAMPLE_REMIX_FILE = "./test/mock-data/sample-remix-trace.json";

describe('Profiler tests', () => {

    it('generate the gas profiler report', async () => {

        const sourceMapFile = fs.readFileSync(SOURCEMAP_FILE, 'utf8');
        const sourceMap = JSON.parse(sourceMapFile).sourceMap;

        const originalSourceCode = fs.readFileSync(CONTRACT_FILE, 'utf8');
        const traceJSONSample = JSON.parse(fs.readFileSync(TRACE_SAMPLE_FILE, 'utf8'))

        // console.log("traceJSONSample", traceJSONSample)

        const bytecode = '608060405234801561001057600080fd5b506103e860008190555060d3806100286000396000f3fe6080604052600436106043576000357c0100000000000000000000000000000000000000000000000000000000900480631865c57d146048578063c19d93fb146070575b600080fd5b348015605357600080fd5b50605a6098565b6040518082815260200191505060405180910390f35b348015607b57600080fd5b50608260a1565b6040518082815260200191505060405180910390f35b60008054905090565b6000548156fea165627a7a72305820b118682270af01d6061a2c91ba2b4b9fcff5384e590e61feef96b98adbdf96410029' // await web3.eth.getCode(contractAddress);

        const result = await new Profiler().getGasPerLineCost(sourceMap, bytecode, originalSourceCode, traceJSONSample)// , 

        console.log(`The result is ${JSON.stringify(result)}`)

        expect(true).toEqual(true)

    })

    it('generate the gas profiler report using GANACHE trace', async () => {

        const sourceMapFile = fs.readFileSync(SOURCEMAP_FILE, 'utf8');
        const sourceMap = JSON.parse(sourceMapFile).sourceMap;

        const originalSourceCode = fs.readFileSync(CONTRACT_FILE, 'utf8');
        const traceJSONSample = JSON.parse(fs.readFileSync(TRACE_SAMPLE_GANACHE_FILE, 'utf8'))

        // console.log("traceJSONSample", traceJSONSample)

        const bytecode = '608060405234801561001057600080fd5b506103e860008190555060d3806100286000396000f3fe6080604052600436106043576000357c0100000000000000000000000000000000000000000000000000000000900480631865c57d146048578063c19d93fb146070575b600080fd5b348015605357600080fd5b50605a6098565b6040518082815260200191505060405180910390f35b348015607b57600080fd5b50608260a1565b6040518082815260200191505060405180910390f35b60008054905090565b6000548156fea165627a7a72305820b118682270af01d6061a2c91ba2b4b9fcff5384e590e61feef96b98adbdf96410029' // await web3.eth.getCode(contractAddress);

        const result = await new Profiler().getGasPerLineCost(sourceMap, bytecode, originalSourceCode, traceJSONSample)// , 

        console.log(`The result is ${JSON.stringify(result)}`)

        expect(true).toEqual(true)

    })

    it.only('generate the gas profiler report using REMIX trace', async () => {

        const sourceMapFile = fs.readFileSync(SOURCEMAP_FILE, 'utf8');
        const sourceMap = JSON.parse(sourceMapFile).sourceMap;

        const originalSourceCode = fs.readFileSync(CONTRACT_FILE, 'utf8');
        const traceJSONSample = JSON.parse(fs.readFileSync(TRACE_SAMPLE_REMIX_FILE, 'utf8'))

        // console.log("traceJSONSample", traceJSONSample)

        const bytecode = '608060405234801561001057600080fd5b506103e860008190555060d3806100286000396000f3fe6080604052600436106043576000357c0100000000000000000000000000000000000000000000000000000000900480631865c57d146048578063c19d93fb146070575b600080fd5b348015605357600080fd5b50605a6098565b6040518082815260200191505060405180910390f35b348015607b57600080fd5b50608260a1565b6040518082815260200191505060405180910390f35b60008054905090565b6000548156fea165627a7a72305820b118682270af01d6061a2c91ba2b4b9fcff5384e590e61feef96b98adbdf96410029' // await web3.eth.getCode(contractAddress);

        const result = await new Profiler().getGasPerLineCost(sourceMap, bytecode, originalSourceCode, traceJSONSample)// , 

        console.log(`The result is ${JSON.stringify(result)}`)

        expect(true).toEqual(true)

    })

    it('generate the gas profiler report using GETH trace', async () => {

        const sourceMapFile = fs.readFileSync(SOURCEMAP_FILE, 'utf8');
        const sourceMap = JSON.parse(sourceMapFile).sourceMap;

        const originalSourceCode = fs.readFileSync(CONTRACT_FILE, 'utf8');
        const traceJSONSample = JSON.parse(fs.readFileSync(TRACE_SAMPLE_GETH_FILE, 'utf8'))

        // console.log("traceJSONSample", traceJSONSample)

        const bytecode = '608060405234801561001057600080fd5b506103e860008190555060d3806100286000396000f3fe6080604052600436106043576000357c0100000000000000000000000000000000000000000000000000000000900480631865c57d146048578063c19d93fb146070575b600080fd5b348015605357600080fd5b50605a6098565b6040518082815260200191505060405180910390f35b348015607b57600080fd5b50608260a1565b6040518082815260200191505060405180910390f35b60008054905090565b6000548156fea165627a7a72305820b118682270af01d6061a2c91ba2b4b9fcff5384e590e61feef96b98adbdf96410029' // await web3.eth.getCode(contractAddress);

        const result = await new Profiler().getGasPerLineCost(sourceMap, bytecode, originalSourceCode, traceJSONSample)// , 

        console.log(`The result is ${JSON.stringify(result)}`)

        expect(true).toEqual(true)

    })
})
