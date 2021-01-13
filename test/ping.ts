import { describe } from 'mocha';
import { expect } from 'chai';
import { ping } from '../src/api';

describe('ping', () => {
    it('should respond an OK status code', async () => {
        const result = await ping()
        expect(result.statusCode).to.equal(200)
    })
    it('should say that it is alive', async () => {
        const result = await ping()
        expect(result.body).to.equal("I'm alive!\n")
    })
})
