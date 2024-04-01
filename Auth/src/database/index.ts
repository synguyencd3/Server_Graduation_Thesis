// database related modules
// export * as databaseConnection  from "./connection";
// export * as AuthRepository  from "./repository/auth-repository";

module.exports = {
    databaseConnection: require('./connection'),
    AuthRepository: require('./repository/auth-repository'),
}