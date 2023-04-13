window.MathJax = {
    tex: {
        inlineMath: [['$$', '$$']]
    },
    options: {//Context menu di MathJax disabilitato per default
        enableMenu: false
    },
    startup: {
        pageReady() {//Mostro gli elementi una volta che sono stati convertiti
            
            return MathJax.startup.defaultPageReady().then(() => {
                //console.log('Rendering formule completo');
                const array = [...document.body.querySelectorAll('span.math')];
                array.forEach(span => span.classList.add('loaded'));
            });
        }
    }
};
/**
 * Renders an element created after page loaded
 * @param {HtmlElement} e The element to render
 * @returns {Promise<void>|null}
 */
function RenderMathJax (e) {
    if (!e) return null;
    let promise = Promise.resolve();
    promise = promise.then(() => MathJax.typesetPromise([e]))
        .catch((err) => warn('MathJax failed: ' + err.message));
    return promise;
}
