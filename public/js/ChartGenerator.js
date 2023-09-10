class ChartGenerator{
  /**
   * @param {*} context Le contexte dans lequel doit être généré le graphique
   * @param {object} response La réponse contenant toutes les informations de stats
   * @param {object} chartParams Paramètres relatifs au diagramme
   * @param {string} chartParams.chartType Type de diagramme
   * @param {string} chartParams.chartTitle Titre du diagramme
   * @param {string} chartParams.titlePosition Position du titre du diagramme
   * @param {Array} chartParams.sectionColors Couleur de fond des sections
   * @param {string} chartParams.chartAxis Axe du diagramme
   * @param {number} chartParams.borderWidth Epaisseur bordure
   * @param {string} chartParams.borderColor Couleur bordure
   * @param {string} chartParams.chartSubtitle Sous titre du diagramme
   * @param {object} dataParams Paramètres relatifs à l'affichage des données du diagramme
   * @param {string} dataParams.dataTitle (apparaît au survol)
   * @param {boolean} dataParams.displayPercent Permet d'afficher ou non le pourcentage
   * @param {string} dataParams.percentageTitlePosition position du titre (pourcentage)
   * @param {string} dataParams.percentageTitleColor couleur du titre (pourcentage)
   */
  generateChart(context, response, chartParams={chartType, chartTitle, titlePosition:'center', sectionColors:null, chartAxis:'x', borderWidth:0, bordercolor:null, chartSubtitle:null}, dataParams = {dataTitle, displayPercent:false, percentageTitlePosition:'center', percentageTitleColor:null}){
        let nbTab = [];
        let total = 0;
        
        for(let obj in response){
          if(response[obj].nb){
            nbTab.push(response[obj].nb);
            total+= response[obj].nb;
          }
        }

        const percentageLabel = (dataParams.displayPercent)? {
          color: dataParams.percentageTitleColor,
          fontSize: 16,
          formatter: (val) => {
            const percentage = (val/ total) * 100 ;
            const roundedPercentage = Math.round((percentage.toPrecision(3) * 100)) / 100
            return `${roundedPercentage}%`
          },
          labels: {title: 
            {font: 
              {weight: 'bold', size: 13},
              anchor: dataParams.percentageTitlePosition,
            }
          }
        }: {display: false};

        const chart = new Chart(context, 
        {
          type: chartParams.chartType,
          options: {
            plugins: {
              subtitle: {
                display: true,
                text: chartParams.chartSubtitle,
                position: 'bottom',
                padding: {
                  top: 22,
                  bottom: 5
                }
              },
              title: {
                display: true,
                text: chartParams.chartTitle,
                position:chartParams.titlePosition,
                font:{
                  size: 16
                }
              },
              value:{
                color: dataParams.percentageTitleColor
              },
              datalabels:percentageLabel
            },
            indexAxis: chartParams.chartAxis
          },
          data: {
            labels: response.labelTab,
            datasets: [
              {
                label: dataParams.dataTitle,
                data: nbTab,
                backgroundColor: chartParams.sectionColors,
                borderWidth: chartParams.borderWidth,
                borderColor: chartParams.borderColor,
                hoverOffset: 4
              }
            ]
          }
        });

        return chart;
    }

    /**
     * Détruit le ou les graphiques souhaités du canvas
     * @param {*} chartIdTab id du canvas contenant le graphique
     */
    deleteChart(chartIdTab){

      for(let chartId of chartIdTab){
          let chartStatus = Chart.getChart(chartId);

        if (chartStatus != undefined) {
          chartStatus.destroy();
        }
      }
    }
}