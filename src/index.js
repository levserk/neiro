const init = () => {
    console.log(`init 12`, `width: ${document.documentElement.clientWidth} height: ${document.documentElement.clientHeight}`);
};

init();


if (module.hot) {
    module.hot.accept(['./index.js'], () => {
        init();
    });
}

