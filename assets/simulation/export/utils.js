
/**
 * @param {any} obj the object to repeat
 * @param {number} count the times to repeat obj
 * @returns {any[]} an array like [obj, obj, ..., obj] count times
 */
function repeat(obj, count)
{
    let arr = new Array(Number(count));
    for (let i = 0; i < arr.length; i++)
    {
        arr[i] = obj;
    }
    return arr;
}

function hasXLSX()
{
    if (typeof XLSX !== 'object')
        return false;
    return XLSX.hasOwnProperty('version');
}

function GenerateWorkBook(allRows)
{
    if (!hasXLSX() || allRows.length === 0)
        return null;
    /**
     * @param {string} letter 
     * @returns {string}
     */
    function matr(letter)
    {
        return `${letter}3:${letter + String(allRows.length)}`;
    }
    
    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    worksheet[matr('K')] = {}
    XLSX.utils.sheet_set_array_formula(worksheet, matr('K'), matr('B') + '-' + matr('H'));
    XLSX.utils.sheet_set_array_formula(worksheet, matr('L'), `B1 * POWER(${matr('B')}, 2) * ${matr('F')}`);
    
    XLSX.utils.sheet_set_array_formula(worksheet, matr('M'), `0.5 * B1 * (POWER(${matr('C')}, 2) + POWER(${matr('B')}*${matr('F')}, 2))`);
    XLSX.utils.sheet_set_array_formula(worksheet, matr('N'), `0.5 * D1 * POWER(${matr('I')}, 2)`);
    XLSX.utils.sheet_set_array_formula(worksheet, matr('O'), `J1 * D1 * ${matr('H')}`);
    XLSX.utils.sheet_set_array_formula(worksheet, matr('P'), `0.5 * H1 * POWER(${matr('K')} - F1, 2)`);
    
    XLSX.utils.sheet_set_array_formula(worksheet, matr('Q'), [matr('M'), matr('N'), matr('O'), matr('P')].join(" + "));
    XLSX.utils.sheet_set_array_formula(worksheet, matr('R'), `${matr('M')}+${matr('N')}-${matr('O')}-${matr('P')}`);
    
    worksheet["!cols"] = repeat({
        wch: 12
    }, 18);//Enlarge width for a better view of the table

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Simulazione");
    
    if (!workbook.Props) 
        workbook.Props = {};
    
    workbook.Props.Title = "Export dati simulazione";

    return workbook;
}
function WorkBookToString(wb)
{
    if (!wb || !hasXLSX())
    {
        return '';
    }
    console.log(XLSX);
    return XLSX.writeXLSX(wb, { type: 'base64', compression: true });
}

function b64toBlob (b64Data, contentType = 'application/octet-stream', chunkSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += chunkSize)
    {
      const slice = byteCharacters.slice(offset, offset + chunkSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++)
      {
        byteNumbers[i] = slice.charCodeAt(i);
      }      
  
      byteArrays.push( new Uint8Array(byteNumbers) );
    }
  
    return new Blob(byteArrays, { type: contentType });
}