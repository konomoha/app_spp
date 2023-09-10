class AffichageDossier
{
    generateDossierDatatable(dTable, response, dataColumns, dataOrder){
        let headRow = dTable.find(" .head_row");
        headRow.html('');
        headRow.append('<tr></tr>');

        let dataColumnsTab = [];
        let i = 0;

        for(let label of dataColumns){
            dataColumnsTab.push({data : label})
            headRow.find('tr').append(`<th class='text-center'>${label}</th>`);
        }
        
        if($.fn.dataTable.isDataTable(dTable)){
            dTable.DataTable().destroy();
        }

        dTable.DataTable({
            "autoWidth": false,
            data: response,
            columns: dataColumnsTab,
            columnDefs: [
                {width: '5%', targets: [0, 7, 10]},
                {width: '5%', type: "date-eu", targets: 5},
                {width: '8%', targets: [2, 3]},
                {width: '9%', targets: 6}, 
                {width: '10%', targets: [1, 4, 8]}, 
                {width: '20%', targets: 9}, 
            ]
        })

        dTable.DataTable().search('').draw();
        dTable.DataTable().order([dataOrder, 'desc']).draw();
        return dTable;
    }

     /**
      * Affiche tous les dossiers correspondant à une raison de clôture précise
      * @param {CallableFunction} dtFunction 
      */
     dossierPerRaisonCloture(dtFunction)
     {
        let raison = $('#raison_cloture').val();
        let responseFail = new ResponseFail;

        $.ajax({
            type: "GET",
            url: Routing.generate('app_dossiers_clos'),
            beforeSend: function () { $('#spinRaison').fadeIn() },
            complete: function (){$('#spinRaison').fadeOut()},
            datatype: 'json',
            data: {"raison" : raison},
            success: function (response)
            {
                if (response != "erreur_dossier") {
                let dtColumns = ["statut", "matricule", "nom", "nom marital", "prenom", "date demande" ];

                dtFunction($("#dossierTab"), response, dtColumns, 5);
                }
                else {
                    console.log("une erreur est survenue");
                }
            },
 
             error: function (jqXHR, exception) {
                 responseFail.displayFailure(jqXHR, exception);
            }
        })
    }

    /**
     * détruit les datatables générés
     * @param {HTMLElement} dataTab datatable
     */
    destroyDatatable(dataTab){
        if($.fn.dataTable.isDataTable(dataTab)){
            dataTab.DataTable().clear();
            dataTab.DataTable().destroy();
        }

    }
}