'use strict';
var TimeMax = new Decimal(1);
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
        sim.tableMass.r, //A
        sim.tableMass.rPrime, //B
        sim.tableMass.rDoublePrime, //C

        sim.tableMass.theta, //D
        sim.tableMass.thetaPrime, //E
        sim.tableMass.thetaDoublePrime, //F
        
        sim.fallingMass.height, //G
        sim.fallingMass.heightPrime, //H
        sim.fallingMass.heightDoublePrime, //I

    ].map(elem => {
        return {
            t: 'n',
            v: elem.toSignificantDigits(8, Decimal.ROUND_HALF_EVEN),
            z: '0.00E+00'
        }
    });
}

async function Export ()
{
    pause();
    hideExport.disabled = true;
    exportBtn.innerHTML = '...';
    exportBtn.disabled = true;
    simulation.refresh();

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
        [
            {
                t: 's',
                v: 'R [m]'
            },
            {
                t: 's',
                v: 'R. [m/s]'
            },
            {
                t: 's',
                v: 'R.. [m/s^2]'
            },

            {
                t: 's',
                v: 'Theta [rad]'
            },
            {
                t: 's',
                v: 'Theta. [rad/s]'
            },
            {
                t: 's',
                v: 'Theta.. [rad/s^2]'
            },

            {
                t: 's',
                v: 'h [m]'
            },
            {
                t: 's',
                v: 'h. [m/s]'
            },
            {
                t: 's',
                v: 'h.. [m/s^2]'
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
        ]
    ];
    const dataRows = await CalculateAll(my_sim, TimeMax);
    const allRows = headerRows.concat(dataRows);
    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    function matr(letter)
    {
        return `${letter}3:${letter + String(allRows.length)}`;
    }
    XLSX.utils.sheet_set_array_formula(worksheet, matr('J'), matr('A') + '-' + matr('G'));
    XLSX.utils.sheet_set_array_formula(worksheet, matr('K'), `B1 * POWER(${matr('A')}, 2) * ${matr('E')}`);
    
    XLSX.utils.sheet_set_array_formula(worksheet, matr('L'), `0.5 * B1 * (POWER(${matr('B')}, 2) + POWER(${matr('A')}*${matr('E')}, 2))`);
    XLSX.utils.sheet_set_array_formula(worksheet, matr('M'), `0.5 * D1 * POWER(${matr('H')}, 2)`);
    XLSX.utils.sheet_set_array_formula(worksheet, matr('N'), `J1 * ${matr('G')}`);
    XLSX.utils.sheet_set_array_formula(worksheet, matr('O'), `0.5 * H1 * POWER(${matr('J')} - F1, 2)`);
    
    XLSX.utils.sheet_set_array_formula(worksheet, matr('P'), [matr('L'), matr('M'), matr('N'), matr('O')].join(" + "));
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
    XLSX.writeFileXLSX(workbook, 'export.xlsx');

    hideExport.disabled = false;
    exportBtn.innerHTML = 'Esporta';
    exportBtn.disabled = false;
}
exportBtn.onclick = Export;