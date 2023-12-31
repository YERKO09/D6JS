const inputCLP = document.getElementById("monedaCLP")
        const selectMoneda = document.getElementById('tipoMoneda');
        const buscar = document.getElementById("btnBuscar")
        const resultado = document.getElementById("resultado")
        let myChart = null;

        selectMoneda.addEventListener('change', monedaSelec);
        buscar.addEventListener('click', btnConversor);

        async function getMonedas() {
            try {
                const res = await fetch("https://mindicador.cl/api/");
                const monedas = await res.json();
                const { dolar, uf, euro } = monedas;
                return [dolar, uf, euro];
            }
            catch (error) {
                const resLocal = await fetch("mindicador.json");
                const monedasLocal = await resLocal.json();
                const { dolar, uf, euro } = monedasLocal;
                return [dolar, uf, euro];
            }
        }

        async function renderOpcion() {
            try{

                const data = await getMonedas();
                
                let template = `<option value="" selected>Selecccione moneda</option>`;
                data.forEach((ele) => {
                    template += `
                <option value="${ele.codigo}">${ele.nombre}</option>
                `;
            });
            selectMoneda.innerHTML = template;
        }
        catch(e){
            window.alert('error')
        }
        }
        renderOpcion();

        async function monedaSelec() {
            try {
                const res = await fetch(`https://mindicador.cl/api/${selectMoneda.value}`);
                const data = await res.json();
                return data;
            } catch (error) {
                window.alert('Por favor, elije una moneda a convertir');
            };
        };

        async function btnConversor() {
            
            try {
                if (selectMoneda.value != '0') {
                    const valorCLP = parseInt(inputCLP.value);
                    const selectCoin = await monedaSelec();
                    const selectValor = selectCoin.serie[0].valor;

                    if (valorCLP > 0) {
                        const conversion = (valorCLP / selectValor).toFixed(2);
                        resultado.innerText = `${selectCoin.codigo === 'euro' ? '€' : selectCoin.codigo === 'uf' ? 'UF' : '$'} ${conversion}`;
                        renderGrafic();
                    };
                };
            } catch (error) {
                window.alert('Ingresa un número válido');
            };
        };

        async function getCreatDataChart() {
            const conversion = await monedaSelec();
            const valores = await conversion.serie.map(moneda => moneda.valor);
            const dates = await conversion.serie.map(moneda => moneda.fecha);
            const typeDate = dates.map(date => date.slice(0, 10));

            const config = {
                type: "bar",
                data: {
                    labels: typeDate,
                    datasets: [{
                        label: 'Historial de Valor',
                        backgroundColor: "blue",
                        data: valores,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: 'gray' // Cambiar el color del texto del label a blanco
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                
                                    color: 'green' // Cambiar el color del texto en el eje y a blanco
                                
                            }
                        },
                        x: {
                            ticks: {
                                
                                    color: 'gray' // Cambiar el color del texto en el eje x a blanco
                                
                            }
                        }
                    }
                }
            };
            return config;
        };

        async function renderGrafic() {
            const config = await getCreatDataChart();
            const chartDOM = document.getElementById('myChart');

            if (myChart) {
                myChart.destroy();
            };
            myChart = new Chart(chartDOM, config);
        };