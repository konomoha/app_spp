class StatDatatable{
    /**
     * Génère un datable 
     * @param {*} dTable tableau des les données
     * @param {*} response contient les infos nécessaires
     * @param {*} dataColumns nom des champs de la requête sql
     * @param {*} dataOrder numéro de la colonne qui ordonnera le datatable
     * @param {*} orderBy ordre croissant ou décroissant
     */
    generateDatatable(dTable, response, dataColumns, dataOrder=null, orderBy='desc'){
        let headRow = dTable.find(".head_row");
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
            data: response,
            columns: dataColumnsTab,
        })

        dTable.DataTable().search('').draw();
        dTable.DataTable().order([dataOrder, orderBy]).draw();

        return dTable;
    }

    /**
     * détruit les datatables générés
     * @param {Array} dataTab param 1 conteneur, param 2 datatable
     */
    destroyDatatable(dataTab){

        for (let tab of dataTab){
            if($.fn.dataTable.isDataTable(tab[1])){
                tab[0].hide();
                tab[1].DataTable().clear();
                tab[1].DataTable().destroy();
            }
        }
    }
}