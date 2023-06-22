'use strict';
var TimeMax = new Decimal(1);
UpdateTimeMax();

var dtExportCount = 250;
const dtExportCountInput = document.getElementById('dt-export-count');
const dtExportCountShow = document.getElementById('dt-export-count-value-display');
function UpdateDtExportCount()
{
    dtExportCount = Number(dtExportCountInput.value);
    dtExportCountShow.innerHTML = dtExportCount;
}
dtExportCountInput.addEventListener('input', UpdateDtExportCount);
UpdateDtExportCount();

/**
 * 
 * @param {Simulation} sim 
 * @param {Decimal|number|string} max
 * @param {Function} onUpdate
 * @param {Function} callback
 */
function CalculateAll(sim, max, onUpdate, callback)
{
    if (!Decimal.isDecimal(max))
    {
        max = new Decimal(max);
    }
    if (typeof callback !== 'function')
    {
        callback = data => log(data);
    }
    if (typeof onUpdate !== 'function')
    {
        onUpdate = data => log(data);
    }
    /**
     * @param {Simulation} s 
     */
    function getDataFunction(s)
    {
        return [
            s.elapsedTime,//A

            s.tableMass.r, //B
            s.tableMass.rPrime, //C
            s.tableMass.rDoublePrime, //D

            s.tableMass.theta, //E
            s.tableMass.thetaPrime, //F
            s.tableMass.thetaDoublePrime, //G
            
            s.fallingMass.height, //H
            s.fallingMass.heightPrime, //I
            s.fallingMass.heightDoublePrime, //J

            //Fillers to set cell format to EXCEL calculated data
            new Decimal(0), new Decimal(0),
            new Decimal(0), new Decimal(0),
            new Decimal(0), new Decimal(0),
            new Decimal(0), new Decimal(0)
        ];
    }
    /**
     * @param {Decimal} elem 
     */
    function mapDataFunction(elem)
    {
        return {
            t: 'n',
            v: elem.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
            z: '0.000E+00'
        }
    }
    let arr = [
        getDataFunction(sim).map(mapDataFunction)
    ];
    IterateAsync(arr, sim, max, dtExportCount, getDataFunction, mapDataFunction, onUpdate, callback);
}
/**
 * @param {any[]} array
 * @param {Simulation} sim 
 * @param {Decimal|number} timeMax
 * @param {Decimal} count 
 * @param {Function} getDataFunction
 * @param {Function} mapDataFunction
 * @param {Function} updateCallback
 * @param {Function} endCallback
 */
function IterateAsync(array, sim, timeMax, count, getDataFunction, mapDataFunction, updateCallback, endCallback)
{
    if (!sim.elapsedTime.lessThan(timeMax))
    {
        endCallback(array, sim);
        return;
    }
    if (!sim.executeIterations(count))
    {
        endCallback(array, sim);
        throw new Error('End export: simulation failed');
    }
    array.push( getDataFunction(sim).map(mapDataFunction) );
    updateCallback( sim.elapsedTime.div(timeMax).toNumber() );
    setTimeout(IterateAsync, 0.1, array, sim, timeMax, count, getDataFunction, mapDataFunction, updateCallback, endCallback);
}
const tableHeaders = [
    {
        t: 's',
        v: 'Timestamp [s]'
    },
    {
        t: 's',
        v: 'R [m]'
    },
    {
        t: 's',
        v: 'R\' [m/s]'
    },
    {
        t: 's',
        v: 'R\'\' [m/s^2]'
    },

    {
        t: 's',
        v: 'Theta [rad]'
    },
    {
        t: 's',
        v: 'Theta\' [rad/s]'
    },
    {
        t: 's',
        v: 'Theta\'\' [rad/s^2]'
    },

    {
        t: 's',
        v: 'h [m]'
    },
    {
        t: 's',
        v: 'h\' [m/s]'
    },
    {
        t: 's',
        v: 'h\'\' [m/s^2]'
    },

    {
        t: 's',
        v: 'l [m]'
    },
    {
        t: 's',
        v: 'Momentum [J/s]'
    },

    {
        t: 's',
        v: 'T1 [J]'
    },
    {
        t: 's',
        v: 'T2 [J]'
    },
    {
        t: 's',
        v: 'Ug [J]'
    },
    {
        t: 's',
        v: 'Uk [J]'
    },
    {
        t: 's',
        v: 'T+U [J]'
    },
    {
        t: 's',
        v: 'T-U [J]'
    },
];
/**
 * @param {any[]} dataRows 
 * @param {Simulation} sim 
 */
function ExportEnd(dataRows, sim)
{
    const headerRows = [
        [
            {
                t: 's',
                v: 'm1 [kg]'
            },
            {
                t: 'n',
                v: sim.tableMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'm2 [kg]'
            },
            {
                t: 'n',
                v: sim.fallingMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'l [m]'
            },
            {
                t: 'n',
                v: springRelaxLength.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'k [N/m]'
            },
            {
                t: 'n',
                v: sim.k.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'g [m/s^2]'
            },
            {
                t: 'n',
                v: g.toSignificantDigits(5, Decimal.ROUND_HALF_EVEN)
            },
            {
                t: 's',
                v: 'dt [s]'
            },
            {
                t: 'n',
                v: sim.dt.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN)
            },
            {
                t: 's',
                v: 'Peso accelerazione'
            },
            {
                t: 'n',
                v: sim.cavalieriWeight.toSignificantDigits(3, Decimal.ROUND_HALF_EVEN)
            }
        ],
        tableHeaders
    ];
    const allRows = headerRows.concat(dataRows);
    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    function matr(letter)
    {
        return `${letter}3:${letter + String(allRows.length)}`;
    }
    function repeat(obj, count)
    {
        let arr = [];
        for (let i = 0; i < count; i++)
        {
            arr.push(obj);
        }
        return arr;
    }
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
        wch: 10
    }, 18);//Enlarge width for a better view of the table

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Simulazione");
    
    if (!workbook.Props) 
        workbook.Props = {};
    
        workbook.Props.Title = "Export dati simulazione";

    XLSX.writeFileXLSX(workbook, 'export.xlsx');
}
function Export(onUpdate, onSuccess, onError, onFinally)
{
    const exportSim = new Simulation(simulation.Engine, tableMass.clone(), fallingMass.clone(), null, null, TableMeasures, dtCount);
    RefreshSimulationParams(exportSim);
    CalculateAll(exportSim, TimeMax, onUpdate, (data, sim) => {
        try {
            ExportEnd(data, sim);
            onSuccess();
        } catch(e) {
            onError(e);
        } finally {
            onFinally();
        }
    });
}
exportBtn.onclick = () => {
    if (exportBtn.disabled) return;
    pause();
    RefreshSimulationParams(simulation);
    UpdateTimeMax();
    UpdateDtExportCount();
    const expectedRows = TimeMax.div(simulation.dt.times(dtExportCount)).floor().plus(1);
    const totalExpectedRows = TimeMax.div(simulation.dt).floor().plus(1);
    if (!confirm(
        `Stai per avviare il calcolo di un\'intera simulazione.\n` +
        `Sarà creato un file XLSX con ${expectedRows.toSignificantDigits(7)} righe.\n` +
        `Nonostante ciò le righe calcolate saranno ${totalExpectedRows.toSignificantDigits(7)}.\n` +
        `La pagina potrebbe freezarsi; se il browser ti dovesse chiedere di attendere, cliccare su Attendi fino a fine operazione.\n` + 
        `Cliccare Ok per iniziare...`))
        return; 
    reset();
    hideExport.disabled = true;
    exportBtn.disabled = true;
    const oldUnload = window.onbeforeunload;
    window.onbeforeunload = () => 'Sei sicuro di voler chiudere la pagina?\nL\'export in corso andrà perso.';
    Export(
        percentage => {
            exportBtn.innerHTML = 'Progresso: ' + (percentage * 100).toFixed(2) + '%';
        },
        () => log('Export effettuato'), 
        e => {
            exportBtn.innerHTML = '&Egrave; avvenuto un errore...';
            err(e);
        }, 
        () => {
            hideExport.disabled = false;
            setTimeout(() => {
                exportBtn.innerHTML = 'Esporta';
            }, 1000);
            exportBtn.disabled = false;
            window.onbeforeunload = oldUnload;
            reset();
        });    
};