'use strict';
class CookieDict
{
    /**
     * @param {string} name The cookie name
     * @returns {any} The requested cookie
     */
    get(name)
    {
        if (!name)
            return undefined;
        const cookies = document.cookie.split('; ').filter(str => str.length > 0);
        for (const cookie of cookies)
        {
            const [key, value] = cookie.split('=');
            if (key === name)
                return value;
        }
        return undefined;
    }
    /**
     * Sets a cookie
     * @param {string} name The cookie name
     * @param {any} value The value of the cookie
     * @param {Date|number} expires When the cookie will be cancelled
     * @param {string} path The path for the cookie
     * @returns {CookieDict} This instance
     */
    set(name, value, expires = 24 * 3600 * 1000, path = '/')
    {
        if (!name || !value)
            return this;
        name = String(name).replace('=', '').replace(';', '');
        value = String(value).replace('=', '').replace(';', '');
        let date = new Date();
        if (expires instanceof Date)
        {
            date = expires;
        } else if (typeof expires === 'number')
        {
            if (!isNaN(expires) && isFinite(expires))
            {
                date.setTime(date.getTime() + expires);
            }
        }
        document.cookie = `${name}=${value}; path=${path}; SameSite=Strict; expires=${date.toUTCString()}`;
        return this;
    }
}
const Cookies = new CookieDict();