let chai = require('chai'),
    chaiSubset = require('chai-subset'),
    _ = require('lodash'),
    Books = require('../../main/model/Books'),
    Account = require('../../main/model/Account'),
    Transaction = require('../../main/model/Transaction'),
    Posting = require('../../main/model/Posting'),
    // Memoize = require('../../shared/modules/memoize/Memoize'),
    // Observe = require('../../shared/modules/observe/Observe'),
    JsonUtil = require('../../shared/modules/json/JsonUtil'),
    {DEBIT, CREDIT} = require('../../main/model/Types').DebitCredit,
    {FIXED_ASSET, CURRENT_ASSET, LONG_TERM_LIABILITY, CURRENT_LIABILITY, CAPITAL, EXPENSE, REVENUE} = require('../../main/model/Types').AccountType;

chai.should();
chai.use(chaiSubset);

function jsEqual(chai, utils) {
    var Assertion = chai.Assertion;

    Assertion.addMethod('jsEql', function (expected) {
        new Assertion(this._obj.toJS()).to.eql(expected);
    });
}

function jsMatch(chai, utils) {
    var Assertion = chai.Assertion;

    Assertion.addMethod('jsMatch', function (expected) {
        new Assertion(this._obj.toJS()).to.containSubset(expected);
    });
}

chai.use(jsEqual);
chai.use(jsMatch);

function credit(...acctsAmounts) {
    const type = CREDIT;
    const acctAmountPairs = _.chunk(acctsAmounts, 2);
    return acctAmountPairs.map( ([acct, amount]) => new Posting(acct.id, type, amount));
}

function debit(...acctsAmounts) {
    const type = DEBIT;
    const acctAmountPairs = _.chunk(acctsAmounts, 2);
    return acctAmountPairs.map( ([acct, amount]) => new Posting(acct.id, type, amount));
}


describe("Books", function () {
    this.timeout(100);
    let date1 = new Date("2010-10-01");
    let date2 = new Date("2010-10-02");
    let date3 = new Date("2010-10-03");
    let books, a, b, c, d;

    function transaction(date, debits, credits) {
        books = books.addTransaction(new Transaction(date, "Transaction " + (transaction.seqNo++), debits.concat(credits)));
    }
    transaction.seqNo = 0;

    function dcTransaction(date, amount, debitAccount, creditAccount) {
        transaction(date, debit(debitAccount, amount), credit(creditAccount, amount))
    }

    function account(name, code, type) {
        const id = account.nextId++;

        const data = {id, name, code, type};
        books = books.addAccount(data);
        return data;
    }
    account.nextId = 1000;

    beforeEach("set up app", function () {
        // Observe.TEST_clearListeners();
        books = Books.TEST_newInstance;
        a = account("Travel", "3333", EXPENSE);
        b = account("Food", "2222", REVENUE);
        c = account("Heat", "1111", EXPENSE);
        d = account("Light", "4444", EXPENSE);
    });

    describe("Books object", function () {
        it("gets account by id now", function () {
            books.account(a.id).should.jsEql(a);
        });

        it("knows accounts by name now", function () {
            books.accountsByName.should.jsEql([b, c, d, a]);
        });

        it("gets accounts by type sorted by code now", function () {
            books.accountsOfType(EXPENSE).should.jsEql([c, a, d]);
        });

        it("gets account by code now", function () {
            books.accountByCode("2222").should.jsEql(b);
        });
    });

    describe("books object with changing data", function () {
        it("updates account from partial data", function () {
            books = books.updateAccount(b.id, {name: "Water"});
            books.account(b.id).should.jsEql(_.merge({}, b, {name: "Water"}));
        });
        it("re-sorts accounts when names change", function () {
            books = books.updateAccount(b.id, {name: "Water"});
            books.accountsByName.should.jsEql([c, d, a, _.merge({}, b, {name: "Water"})]);
        });
    });

    describe("Books object with transactions", function () {
        it("knows account balances and debit and credit balances", function () {
            dcTransaction(date1, 100, a, b);
            transaction(date2, debit(a, 200, c, 50), credit(b, 200, d, 50));

            books.accountViewsByName().map(it => it.signedBalance).should.jsEql([300, -50, 50, -300]);
            books.accountViewsByName().map(it => it.debitBalance).should.jsEql([null, 50, null, 300]);
            books.accountViewsByName().map(it => it.creditBalance).should.jsEql([300, null, 50, null]);
        });

        it("knows updates to individual account names", function () {
            books = books.updateAccount(a.id, {name: "Travel Expenses"})
                         .updateAccount(b.id, {name: "Entertainment"});

            books.account(a.id).name.should.eql("Travel Expenses");
            books.account(b.id).name.should.eql("Entertainment");

            books = books.updateAccount(b.id, {name: "Customer Ents"});
            books.account(a.id).name.should.eql("Travel Expenses");
            books.account(b.id).name.should.eql("Customer Ents");
        });

        it("returns same functional objects for each call", function () {
            const accA = books.accountByCode(a.code);
            const accA2 = books.accountByCode(a.code);
            accA.should.equal(accA2);
        });
    });

    describe("Json", function () {
        it("can be serialized to JSON and deserialized", function () {
            dcTransaction(date1, 100, a, b);
            transaction(date2, debit(a, 200, c, 50), credit(b, 200, d, 50));

            const json = JsonUtil.toStore(books);
            // console.log("json", json);
            const newBooks = JsonUtil.fromStore(json);
            // console.log("newBooks", newBooks);

            newBooks.accountViewsByName().map(it => it.signedBalance).should.jsEql([300, -50, 50, -300]);
            newBooks.accountViewsByName().map(it => it.debitBalance).should.jsEql([null, 50, null, 300]);
            newBooks.accountViewsByName().map(it => it.creditBalance).should.jsEql([300, null, 50, null]);
        });

    });

    describe("trial balance", function () {

        it("has accounts with non-zero balances and debit totals", function () {

            transaction(date1, debit(a, 100), credit(b, 100));

            let tb = books.trialBalance;
            tb.accounts.should.jsMatch([b, a]);
            tb.debitTotal.should.eql(100);
            tb.creditTotal.should.eql(100);

            transaction(date2, debit(a, 200, c, 50), credit(b, 200, d, 50));

            tb = books.trialBalance;
            tb.accounts.should.jsMatch([c, b, a, d]);
            tb.debitTotal.should.eql(350);
            tb.creditTotal.should.eql(350);

        });
    });

    describe("balance sheet", function () {
        it("has amounts in correct categories sorted by code", function () {
            const
                faFurniture = account("Furniture", "5557", FIXED_ASSET),
                faMachines = account("Machines", "5554", FIXED_ASSET),
                capital = account("Capital", "4000", CAPITAL);

            dcTransaction(date1, 100, faMachines, capital);
            dcTransaction(date1, 75, faFurniture, capital);
            dcTransaction(date2, 150, faFurniture, capital);

            const bs = books.balanceSheet(date2);
            bs.fixedAssets.accounts.map( it => [it.name, it.balance]).should.jsEql( [["Machines", 100], ["Furniture", 225]]);
            bs.fixedAssets.total.should.eql(325);

            bs.capitalReserves.accounts.map( it => [it.name, it.balance]).should.jsEql( [["Capital", 325]]);
            bs.capitalReserves.total.should.eql(325);

        });

        it("has balances as at given date", function () {
            const fa1 = account("Machines", "5555", FIXED_ASSET);
            const fa2 = account("Furniture", "5556", FIXED_ASSET);
            const cap = account("Capital", "4000", CAPITAL);

            transaction(date1, debit(fa1, 100), credit(cap, 100));
            transaction(date2, debit(fa2, 200), credit(cap, 200));

            const bs1 = books.balanceSheet(date1);
            const bs2 = books.balanceSheet(date2);

            bs1.fixedAssets.total.should.eql(100);
            bs1.capitalReserves.total.should.eql(100);

            bs2.fixedAssets.total.should.eql(300);
            bs2.capitalReserves.total.should.eql(300);

        });
    });


});