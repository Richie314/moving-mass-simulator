'use strict';
var TimeMax = new Decimal(1);
UpdateTimeMax();
/**
 * 
 * @param {Simulation} sim 
 * @param {Decimal|number|string} max
 * @returns {object[][]}
 */
async function CalculateAll(sim, max)
{
    if (!Decimal.isDecimal(max))
    {
        max = new Decimal(max);
    }
    let arr = [];
    do {
        try {
            arr.push(await IterateAsync(sim, sim.dtCount));
        } catch {
            //End the export
            return arr;
        }
    } while (sim.elapsedTime.lessThan(max));
    return arr;
}
/**
 * 
 * @param {Simulation} sim 
 * @param {Decimal} count 
 */
async function IterateAsync(sim, count)
{
    if (!sim.executeIterations(count))
    {
        throw new Error('End export');
    }
    return [
        sim.elapsedTime,//A

        sim.tableMass.r, //B
        sim.tableMass.rPrime, //C
        sim.tableMass.rDoublePrime, //D

        sim.tableMass.theta, //E
        sim.tableMass.thetaPrime, //F
        sim.tableMass.thetaDoublePrime, //G
        
        sim.fallingMass.height, //H
        sim.fallingMass.heightPrime, //I
        sim.fallingMass.heightDoublePrime, //J

        //Fillers to set cell format to EXCEL calculated data
        new Decimal(0), new Decimal(0),
        new Decimal(0), new Decimal(0),
        new Decimal(0), new Decimal(0),
        new Decimal(0), new Decimal(0),

    ].map(elem => {
        return {
            t: 'n',
            v: elem.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
            z: '0.000E+00'
        }
    });
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
]
async function Export ()
{

    let my_sim = new Simulation(simulation.Engine, tableMass.clone(), fallingMass.clone(), null, null, TableMeasures, dtCount);
    const headerRows = [
        [
            {
                t: 's',
                v: 'm1 [kg]'
            },
            {
                t: 'n',
                v: my_sim.tableMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'm2 [kg]'
            },
            {
                t: 'n',
                v: my_sim.fallingMass.mass.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'l [m]'
            },
            {
                t: 'n',
                v: my_sim.cable.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'k [N/m]'
            },
            {
                t: 'n',
                v: my_sim.k.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
                z: '0.00E+00'
            },
            {
                t: 's',
                v: 'g [m/s^2]'
            },
            {
                t: 'n',
                v: g.toSignificantDigits(5, Decimal.ROUND_HALF_EVEN)
            }
        ],
        tableHeaders
    ];
    const dataRows = await CalculateAll(my_sim, TimeMax);
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
exportBtn.onclick = () => {
    pause();
    reset();
    const expectedRows = TimeMax.div(simulation.dt.times(dtCount)).floor().plus(2);
    if (!confirm(
        `Stai per avviare il calcolo di un\'intera simulazione.\n` +
        `Sarà creato un file XLSX con ${expectedRows.toSignificantDigits(7)} righe.\n` +
        `La pagina potrebbe freezarsi; se il browser ti dovesse chiedere di attendere, cliccare su Attendi fino a fine operazione.\n` + 
        `Cliccare Ok per iniziare...`))
        return; 
    hideExport.disabled = true;
    exportBtn.innerHTML = '...';
    exportBtn.disabled = true;
    setTimeout(() => { //To see the ... in the button
        Export().then(() => {
            log('Export effettuato');
        }).catch(error => {
            err(error);
        }).finally(() => {
            hideExport.disabled = false;
            exportBtn.innerHTML = 'Esporta';
            exportBtn.disabled = false;
        })
    }, 100);
    
};