import Network from './instances/network.js'

const init = () => {
    console.log(`init 12`, `width: ${document.documentElement.clientWidth} height: ${document.documentElement.clientHeight}`);
    let network = new Network({});
    console.log(network);
    let scheme = network.getScheme();
    console.log(scheme);
    console.log(new Network(scheme))

};

init();


if (module.hot) {
    module.hot.accept(['./index.js'], () => {
        init();
    });
}

