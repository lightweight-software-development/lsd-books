const _ = require('lodash'),
    JsonUtil = require('../../../shared/modules/json/JsonUtil');

function enumValues(clazz, ...enumArgs) {
    for(const n of enumArgs) {
        const instanceArgs = _.isArray(n) ? n : [n];
        clazz[instanceArgs[0]] = new clazz(...instanceArgs);
    }
}

class DebitCredit {

    constructor(name) {
        this.name = name;
    }
    toString() {
        return this.name;
    }
    toJSON() {
        return {"@type": this.constructor.name, name: this.name};
    }

}
enumValues(DebitCredit, 'DEBIT', 'CREDIT');

const {DEBIT, CREDIT} = DebitCredit;
JsonUtil.registerClass(DebitCredit);


class AccountType {
    static toStoreJson(obj) {
        return {name: obj.name};
    }

    constructor(name, normalBalanceType) {
        this.name = name;
        this.normalBalanceType = normalBalanceType;
    }

    toString() {
        return this.name;
    }

    get isAsset() { return this === AccountType.FIXED_ASSET || this === AccountType.CURRENT_ASSET}
    get isLiability() { return this === AccountType.LONG_TERM_LIABILITY || this === AccountType.CURRENT_LIABILITY}

    toJSON() {
        return {"@type": this.constructor.name, name: this.name};
    }


}

enumValues(AccountType,
    ['FIXED_ASSET', DEBIT],
    ['CURRENT_ASSET', DEBIT],
    ['LONG_TERM_LIABILITY', CREDIT],
    ['CURRENT_LIABILITY', CREDIT],
    ['CAPITAL', CREDIT],
    ['EXPENSE', DEBIT],
    ['REVENUE', CREDIT]);

JsonUtil.registerClass(AccountType);


module.exports = {DebitCredit, AccountType};