$(document).ready(function(){

    Chart.register(ChartDataLabels);
    const chartGenerator = new ChartGenerator();
    const statDatatable = new StatDatatable();
    const dataExport = new DataExport();
    const responseFail = new ResponseFail();
    const allCanvas = document.getElementsByTagName('canvas');
    const allcanvasId = [];

    //On récupère tous les id de tous les canvas (servira pour la méthode deleteChart)
    for(canvas of allCanvas){
      allcanvasId.push(canvas.getAttribute('id'));
    }

  $('#demande_stat_btn').click(function(){

    $('.btn_stat').removeClass('btn_actif');
    $(this).toggleClass('btn_actif');

    destroyDt();

    const demandeGlobalContext = document.getElementById('chartDemandeGlobal');
    let colorTab = ['rgb(0, 153, 51, 0.9)','rgb(208, 168, 128)', 'rgb(255, 51, 51)', 'rgb(149, 56, 156, 0.9)'];

    $.ajax({
      url: Routing.generate('app_stat_demande_doughnut'),
      type: "GET",
      beforeSend: function () { $('.spin_admin').fadeIn() },
      complete: function (){$('.spin_admin').fadeOut()},
      data:{},
      success: function (response){

        chartGenerator.deleteChart(allcanvasId);
        
        $("#conteneur_stat_demande").show();
        $('#conteneur_datatable_demande, #conteneur_datatable_echeance, #conteneur_datatable_assure, #conteneur_stat_echeance, #conteneur_datatable_courrier, #conteneur_stat_assure, #conteneur_stat_courrier').hide();

        const chartDemandeGlobal = chartGenerator.generateChart(demandeGlobalContext, response, {chartType: 'doughnut', chartTitle:"Demandes suivi pot-professionnel", titlePosition: "top", chartSubtitle:'(Cliquez sur un segment pour plus de détails)',sectionColors: colorTab, chartAxis: 'x', borderWidth: 0, borderColor: 'white'}, {dataTitle:"Nombre de demandes", displayPercent: true, percentageTitlePosition: "center", percentageTitleColor:"white"})

        chartDemandeGlobal.options['onClick'] = function(e, activeStatut){
          //On entre dans la condition en cas de clic sur une section du diagramme 
          if(activeStatut[0]){
            
            const demandeDetailContext = document.getElementById('chartDemande');

            destroyDt();
            chartGenerator.deleteChart(['chartDemande', 'chartagentCausal']);

            let datasetIndex = activeStatut[0].datasetIndex;
            let dataIndex = activeStatut[0].index;
            let datasetLabel = e.chart.data.datasets[datasetIndex].label;
            let value = e.chart.data.datasets[datasetIndex].data[dataIndex];
            let statut = e.chart.data.labels[dataIndex];

            $.ajax({
              url: Routing.generate('app_stat_demande_bar'),
              type:'GET',
              beforeSend: function () { $('.spin_admin').fadeIn() },
              complete: function (){$('.spin_admin').fadeOut()},
              data: {'statut' : statut},
              success: function(response){

                const chartDemandeDetail = chartGenerator.generateChart(demandeDetailContext, response, {chartType:"line", chartTitle: "Demandes de suivi post-professionnel " + statut.toLowerCase(), chartSubtitle:'(Cliquez sur un point pour plus de détails)', borderWidth: 2}, {dataTitle: "Nombre de demandes"})

                chartDemandeDetail.options['onClick'] = function(e, activeYear){

                  if(activeYear[0]){
                    const agentCausalContext = document.getElementById('chartagentCausal');
                    chartGenerator.deleteChart(['chartagentCausal']);
                    destroyDt();

                    let dataIndex = activeYear[0].index;
                    let datasetIndex = activeYear[0].datasetIndex;
                    let selectedYear = e.chart.data.labels[dataIndex];
                    $.ajax({
                      url: Routing.generate('app_stat_demande_cancer'),
                      type: 'GET',
                      beforeSend: function () { $('.spin_admin2').fadeIn() },
                      complete: function (){$('.spin_admin2').fadeOut()},
                      data: {'selectedYear' : selectedYear, 'statut' : statut},
                      success: function(response){
                        console.log(response)
                        const chartagentCausal = chartGenerator.generateChart(agentCausalContext, response, {chartType: 'bar', chartTitle:"Demandes " + statut.toLowerCase() +" par agents cancérogènes (" + selectedYear + ")", chartSubtitle:'(Cliquez sur une barre pour plus de détails)', sectionColors: 'rgba(255, 99, 132, 0.5)', borderWidth:1, borderColor: 'rgba(255, 99, 132)', chartAxis:'y'}, {dataTitle:"Nombre de demandes"});

                        //scroll vers bas de page
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                        chartagentCausal.options['onClick'] = function(e, activeAgent){

                          if(activeAgent[0]){

                            let dataIndex = activeAgent[0].index;
                            let libelle = e.chart.data.labels[dataIndex];

                            let dataColumns = ['matricule', 'nom', 'nom_marital', 'prenom', 'date_demande'];

                            (statut === "Clôturées")? dataColumns.push("raison_cloture") : "";

                            $.ajax({
                              url: Routing.generate('app_stat_demande_datatable'),
                              type:'GET',
                              beforeSend: function () { $('.spin_admin3').fadeIn() },
                              complete: function (){$('.spin_admin3').fadeOut()},
                              data: {'selectedYear' : selectedYear, 'libelle' : libelle, 'statut' : statut},
                              success: function(response){
                                setExportBtn($('#conteneur_datatable_demande .export_btn'), Routing.generate('app_export_demande', {'agentCausal': libelle, 'selectedYear':selectedYear, 'statutData': statut}))
                                
                                $('#datatable_demande_title').text(`Demandes de suivi - ${libelle.toLowerCase()} (${selectedYear})`);
                                $('#conteneur_datatable_demande').show()
                                
                                //On génère un datatable
                                statDatatable.generateDatatable($('#demande_datatable'), response, dataColumns, 6);

                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                              }
                            })
                          }
                        }
                      },
                      error: function(jqXHR, exception){
                        responseFail.displayFailure(jqXHR, exception)
                      }
                    })
                  }
                }
              },
              error: function(jqXHR, exception){
                responseFail.displayFailure(jqXHR, exception)
              }
            })
          }
        }
      },
      error: function(jqXHR, exception){
        responseFail.displayFailure(jqXHR, exception)
      }
    });
  })

  $("#echeance_stat_btn").click(function(){

    destroyDt();

    $('.btn_stat').removeClass('btn_actif');
    $(this).toggleClass('btn_actif');

    const echeanceContext = document.getElementById("chartEcheance");
    $.ajax({
      url: Routing.generate('app_stat_echeance'),
      type: "GET",
      beforeSend: function () { $('.spin_admin').fadeIn() },
      complete: function (){$('.spin_admin').fadeOut()},
      success: function(response){

        chartGenerator.deleteChart(allcanvasId);
        $("#conteneur_stat_echeance").show();
        $("#conteneur_stat_demande, #conteneur_stat_assure, #conteneur_stat_courrier, #conteneur_datatable_echeance, #conteneur_datatable_demande, #conteneur_datatable_courrier, #conteneur_datatable_assure").hide();

        const chartEcheance = chartGenerator.generateChart(echeanceContext, response, {chartType:'bar', chartTitle:"Total des échéances par année", chartSubtitle:'(Cliquez sur une barre pour plus de détails)', sectionColors:'rgba(153, 102, 255, 0.6)'}, {dataTitle: "Nombre d'échéances"});

        chartEcheance.options['onClick'] = function(e, activeEcheanceYear){

          if(activeEcheanceYear[0]){

            destroyDt();
            
            const echeanceYearContext = document.getElementById("chartEcheanceYear");
            chartGenerator.deleteChart(['chartEcheanceYear']);

            let colorTab = ['rgba(255, 159, 64, 0.7)', 'rgba(75, 192, 192)'];
            let dataIndex = activeEcheanceYear[0].index;
            let selectedYear = e.chart.data.labels[dataIndex];

            $.ajax({
              url: Routing.generate('app_stat_echeance_year'),
              type: 'GET',
              beforeSend: function () { $('.spin_admin').fadeIn() },
              complete: function (){$('.spin_admin').fadeOut()},
              data: {'selectedYear' : selectedYear},
              success: function(response){
                const chartEcheanceYear = chartGenerator.generateChart(echeanceYearContext, response, {chartType: 'doughnut', chartTitle: "Echéances " + selectedYear, chartSubtitle:'(Cliquez sur un segment pour plus de détails)', sectionColors: colorTab, borderWidth:1}, {dataTitle:"Nombre d'échéances", displayPercent:true, percentageTitleColor: 'white'});

                chartEcheanceYear.options['onClick'] = function(e, activeStatus){

                  let echeanceDatatble = $('#echeance_datatable');
                  let dataIndex = activeStatus[0].index;
                  let selectedStatus = e.chart.data.labels[dataIndex];
                  let finEcheance = "false";
                  if(selectedStatus === 'Terminées'){
                    finEcheance = "true";
                  }

                  $.ajax({
                    url: Routing.generate('app_stat_echeance_datatable'),
                    type: 'GET',
                    beforeSend: function () { $('.spin_admin3').fadeIn() },
                    complete: function (){$('.spin_admin3').fadeOut()},
                    data: {
                      'finEcheance': finEcheance,
                      'selectedYear' : selectedYear
                    },
                    success: function(response){
                      console.log(response);
                      setExportBtn($('#conteneur_datatable_echeance .export_btn'), Routing.generate('app_export_echeance', {'finEcheance' : finEcheance, 'year' : selectedYear}))

                      $('#datatable_echeance_title').text(`Détail des échéances ${selectedStatus.toLowerCase()} (${selectedYear})`);
                      $('#conteneur_datatable_echeance').show()

                      statDatatable.generateDatatable(echeanceDatatble, response, ['matricule', 'nom', 'prenom', 'libelle'], 6);

                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }
                  })
                }
              },
              error: function(jqXHR, exception){
                responseFail.displayFailure(jqXHR, exception)
              }
            })
          }
        }
      },
      error: function(jqXHR, exception){
        responseFail.displayFailure(jqXHR, exception)
      }
    })
  })

  $("#assure_stat_btn").click(function (){

    $('.btn_stat').removeClass('btn_actif');
    $(this).toggleClass('btn_actif');

    destroyDt();

    const assureContext = document.getElementById("chartAssure");

    $.ajax({
      url: Routing.generate("app_stat_assure"),
      type: "GET",
      beforeSend: function () { $('.spin_admin').fadeIn() },
      complete: function (){$('.spin_admin').fadeOut()},
      success: function(response){

        chartGenerator.deleteChart(allcanvasId);
        $("#conteneur_stat_assure").show();
        $("#conteneur_stat_demande, #conteneur_stat_echeance, #conteneur_stat_courrier, #conteneur_datatable_echeance, #conteneur_datatable_demande, #conteneur_datatable_assure, #conteneur_datatable_courrier").hide();

        const chartAssure = chartGenerator.generateChart(assureContext, response, {chartType: 'bar', chartTitle: 'Total des assurés suivis par situation', chartSubtitle:'(Cliquez sur une barre pour plus de détails)', borderWidth:1}, {dataTitle: "nombre d'assurés", displayPercent: true, percentageTitlePosition:'end'});

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

        chartAssure.options['onClick'] = function(e, activeAssureYear){

          if(activeAssureYear[0]){

            destroyDt();
            let assureDatatable = $("#assure_datatable");
            let dataIndex = activeAssureYear[0].index;
            let libelle = e.chart.data.labels[dataIndex];
            
            $.ajax({
              url: Routing.generate('app_stat_assure_datatable'),
              type: "GET",
              beforeSend: function () { $('.spin_admin3').fadeIn()},
              complete: function (){$('.spin_admin3').fadeOut()},
              data: {'situation' : libelle},
              success: function(response){

                setExportBtn( $('#conteneur_datatable_assure .export_btn'), Routing.generate('app_export_assure', {'situation' : libelle }));

                $("#conteneur_datatable_assure").show();
                $('#datatable_assure_title').text(`Détail du suivi des assurés (situation : ${libelle})`);
                statDatatable.generateDatatable(assureDatatable, response, ['matricule', 'nom', 'prenom', 'date_demande', 'agent_causal', 'statut'], 3);

                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              },
              error: function(jqXHR, exception){
                responseFail.displayFailure(jqXHR, exception)
              }
            })
          }
        }
      },
      error: function(jqXHR, exception){
        responseFail.displayFailure(jqXHR, exception)
      }
    }) 
  })

  $('#courrier_stat_btn').click(function (){

    $('.btn_stat').removeClass('btn_actif');
    $(this).toggleClass('btn_actif');

    destroyDt();

    const courrierYearcontext = $('#chartCourrierYear');

    $.ajax({
      url: Routing.generate('app_stat_courrier'),
      type: "GET",
      beforeSend: function () { $('.spin_admin').fadeIn() },
      complete: function (){$('.spin_admin').fadeOut()},
      success: function(response){
        chartGenerator.deleteChart(allcanvasId);
        $("#conteneur_stat_courrier").show();
        $("#conteneur_stat_demande, #conteneur_stat_echeance, #conteneur_stat_assure, #conteneur_datatable_echeance, #conteneur_datatable_demande, #conteneur_datatable_assure, #conteneur_datatable_courrier").hide();
        
        const chartCourrierYear = chartGenerator.generateChart(courrierYearcontext, response, {chartType: 'line', chartTitle:'Total des courriers par année', chartSubtitle:'(Cliquez sur un point pour plus de détails)', sectionColors: ['rgba(75, 192, 192)'], borderWidth: 3, borderColor: 'rgba(75, 192, 192)'}, {dataTitle:'nombre de courriers'});

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

        chartCourrierYear.options['onClick'] = function(e, activeCourrierYear){

          if(activeCourrierYear[0]){
            destroyDt();

            let dataIndex = activeCourrierYear[0].index;
            let selectedYear = e.chart.data.labels[dataIndex];

            const courrierTypeContext = document.getElementById("chartCourrierType");
            chartGenerator.deleteChart(['chartCourrierType']);

            $.ajax({
              url: Routing.generate('app_stat_courrier_type'),
              type: "GET",
              data: {'selectedYear' : selectedYear},
              beforeSend: function () { $('.spin_admin3').fadeIn()},
              complete: function (){$('.spin_admin3').fadeOut()},
              success: function(response){
                
                const chartCourrierType = chartGenerator.generateChart(courrierTypeContext, response, {chartType:'bar', chartTitle: `Total des courriers par agent cancer (${selectedYear})`, chartSubtitle:'(Cliquez sur une barre pour plus de détails)', sectionColors:['rgba(255, 99, 132, 0.7)'], chartAxis:'y', borderWidth:1, borderColor:'rgba(255, 99, 132)'}, {dataTitle:'Nombre de courriers'});

                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                chartCourrierType.options['onClick'] = function(e, courrierActiveType){

                  if(courrierActiveType[0]){
                    destroyDt();
                    let courrierDatatable = $("#courrier_datatable");
                    let dataIndex = courrierActiveType[0].index;
                    let agentCausal = e.chart.data.labels[dataIndex];

                    $.ajax({
                      url: Routing.generate('app_stat_courrier_datatable'),
                      type: "GET",
                      data: {'selectedYear' : selectedYear, 'agentCausal' : agentCausal},
                      beforeSend: function () { $('.spin_admin3').fadeIn()},
                      complete: function (){$('.spin_admin3').fadeOut()},
                      success: function(response){

                        setExportBtn($('#conteneur_datatable_courrier .export_btn'), Routing.generate('app_export_courrier', {'year': selectedYear, 'agentCausal' : agentCausal}));

                        $("#conteneur_datatable_courrier").show();
                        $('#datatable_courrier_title').text(`Détail des courriers - ${agentCausal} (${selectedYear})`);
                        statDatatable.generateDatatable(courrierDatatable, response, ['matricule', 'nom', 'prenom', 'date_demande'], 4);

                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      },
                      error: function(jqXHR, exception){
                        responseFail.displayFailure(jqXHR, exception)
                      }
                    })
                  }
                }
              },
              error: function(jqXHR, exception){
                responseFail.displayFailure(jqXHR, exception)
              }
            })
          }
        }
      },
      error: function(jqXHR, exception){
        responseFail.displayFailure(jqXHR, exception)
      }
    })
  })

  /**
   * Attribue au bouton export la route pour générer un export csv
   */
  function setExportBtn(btn, url){

    btn.attr({'href' : url});
  }

  /**
   * Détruit tous les datatables générés sur le template
   */
  function destroyDt(){
    statDatatable.destroyDatatable([[$('#conteneur_datatable_demande'), $('#demande_datatable')], [$('#conteneur_datatable_echeance'), $('#echeance_datatable')], [$('#conteneur_datatable_assure'), $('#assure_datatable')], [$('#conteneur_datatable_courrier'), $('#courrier_datatable')]]);
  }
})