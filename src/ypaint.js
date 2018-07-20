var Toast = {};
Toast.install = function (Vue, options) {
    Vue.prototype.$msg = 'Hello World';
}
module.exports = Toast;