/**
 * @param {HTMLDivElement} div 
 */
async function LoadAndDisplayRemotePart(div)
{
    if (!div || !div.hasAttribute('data-loadurl'))
        return;
    const url = div.getAttribute('data-loadurl');
    if (!url || url == '')
        return;
    div.removeAttribute('data-loadurl');
    const response = await fetch(url);
    if (!response.ok)
        return;
    const text = await response.text();
    div.innerHTML = text;
    console.log('Loaded page component from url \"' + url + '\"');

}

for (const div of [...document.querySelectorAll('[data-loadurl]')])
{
    LoadAndDisplayRemotePart(div);
}