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
 * 
 * @param {HtmlElement} e
 */
var RenderMathJax = function (e) {
    let promise = Promise.resolve();
    promise = promise.then(() => MathJax.typesetPromise([e]))
        .catch((err) => warn('MathJax failed: ' + err.message));
    return promise;
}
/**
 * 
 * @param {HtmlElement} e
 * @param {string} newContent 
 */
var ReRenderMathJax = function (e, newContent) {
    MathJax.typesetClear([e]);
    e.innerHTML = newContent;
    return RenderMathJax(e);
}
