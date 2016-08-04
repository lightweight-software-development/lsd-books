const React = require('react')
const { connect } = require('react-redux')
const PersistentRouter = require('./PersistentRouter')
const EntityListWithView = require('./EntityListWithView')
const MainPage = require('./MainPage')
const NotFoundPage = require('./NotFoundPage')
const {Locations, Location, NotFound} = require('react-router-component')
const GoogleSignin = require('./GoogleSignin')
const Account = require('../model/Account')
const EntityManager = require('./EntityManager')
const {setAccount} = require('../app/actions')

const config = {
    "clientId": "919408445147-a0csgn7e21d773ilrif3q8d9hfrfc7vm.apps.googleusercontent.com",
    "identityPoolId": "eu-west-1:c46e1da2-72cf-4965-92b8-ebe270684050",
    "bucketName": "ashridgetech.reactbooks-test"
}

const mapStateToProps = (state) => {
    return {
        appState: state
    }
}

let App = React.createClass({
    render: function () {
        return (
            <div>
                <h1>ReactBooks</h1>
                <div id="googleLogin">
                    <GoogleSignin clientId={config.clientId}/>
                </div>
                <Locations hash ref={(c) => this._router = c}>
                    <Location path="/" handler={MainPage}/>
                    <Location path="/account" handler={this.accountList()}/>
                    <Location path="/account/:selectedId" handler={this.accountList()}/>
                    <NotFound handler={NotFoundPage}/>
                </Locations>
            </div>
        )
    },

    navigateToAccount: function(id) {
        this._router.navigate(`/account/${id}`)
    },

    navigateToNewAccount: function() {
        this._router.navigate(`/account/new`)
    },

    accountList: function () {
        class AccountManager extends EntityManager {

            get(id) {
                return appState.accounts.get(id)
            }

            newInstance() {
                return new Account();
            }

            save(entity) {
                const action = setAccount(entity);
                dispatch(action)
                return action.data
            }
        }
        const appState = this.props.appState
        const dispatch = this.props.dispatch
        const entityManager = new AccountManager()
        return (
            <EntityListWithView items={this.props.appState.accountsByName} entityManager={entityManager}
                                onSelect={this.navigateToAccount} onNew={this.navigateToNewAccount}/>
        )
    }
})

App = connect(mapStateToProps)(App)

module.exports = App