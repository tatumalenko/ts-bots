
class Test {
    public constructor() {

    }

    public async test1(): Promise<void> {
        await this.timeout(3000);
        console.log("Timeout complete. Waited 3sec.");
        throw new Error("Ahoh, error thrown inside async method!");
        return;
    }

    public async test2(): Promise<void> {
        try {
            await this.timeout(3000);
            console.log("Timeout complete. Waited 3sec.");
            throw new Error("Ahoh, error thrown inside async method!");
        } catch (e) {
            console.error("But was caught by catch clause:", e);
            throw new Error("Oops, thrown inside catch now!");
        }
        return;
    }

    public async test3(): Promise<void> {
        try {
            console.log("Calling async method that throws an error (without catching it)!");
            await this.test2();
        } catch (e) {
            console.error("Did I catch the test2 error from catch from test1 error thrown?:", e);
        }
    }

    public async test4(): Promise<void> {
        await this.test1();
        return;
    }

    public async test5(): Promise<void> {
        await this.test4();
        return;
    }

    public async test6(): Promise<void> {
        try {
            console.log("Calling async method that throws an error (without catching it)!");
            await this.test5();
        } catch (e) {
            console.error("Did I catch the test5->4->1 error thrown?:", e);
        }
    }

    public async timeout(ms: number): Promise<void> {
        console.log("Timeout started!");
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
}

(async () => {
    const t = new Test();
    await t.test3();
})();