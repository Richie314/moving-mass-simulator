# Simulazione due masse e molla
Simulazione di un sistema con due oggetti: uno in grado di muoversi su un tavolo senza attrito e uno sotto al tavolo, attaccato al primo tramite un filo.
Sono esaminati varie casistiche: il filo può essere estensibile o non e vari modi di integrazione numerica possono essere selezionati

La simulazione è utilizzabile tramite Github Pages all'indirizzo: <https://richie314.github.io/moving-mass-simulator>

La simulazione impiega la libreria [Decimal.js](https://github.com/MikeMcl/decimal.js) per le integrazioni numeriche e la libreria
[three.js](https://github.com/mrdoob/three.js/) per il rendring 3D. 
La libreria [MathJax](https://github.com/mathjax/MathJax) è usata per visualizzare il LateX.

La funzionalità di esportazione, realizzata tramite [SheetJS](https://github.com/SheetJS/sheetjs), permette di generare un foglio di calcolo
Microsoft Excel, che può permettere di eseguire analisi più approfondite come grafici.

Esempi di grafici Excel ottenuti dagli export dei dati possono essere trovati sotto </assets/exports/>.