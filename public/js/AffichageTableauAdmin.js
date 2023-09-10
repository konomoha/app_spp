class AffichageTableauAdmin
{
    /**
     * Permet de générer un datatable contenant des informations issues de la table sur laquelle on a cliqué
     * @param {string} myroute Nom de la route servant à afficher les informations correspondantes au nom de la table
     */
    genererTable(table)
    {
        const responseFail = new ResponseFail;
        const statDataTable = new StatDatatable();
        
        $.ajax({
            type: "GET",
            url: Routing.generate(`admin_${table.toLowerCase()}_liste`),
            beforeSend: function () { $('.spin_admin').show() },
            complete: function (){$('.spin_admin').hide()},
            success: function (response) {
                if (response != 'error_table') {

                    if($.fn.dataTable.isDataTable($('#adminTab'))){
                        $('#adminTab').DataTable().clear();
                        $('#adminTab').DataTable().destroy();
                    }

                    let url = Routing.generate("admin_"+ table + "_create");
                    let button = $(".admin_ajout a button");

                    $(".admin_ajout").css("display", "flex").show();
                    $(".admin_ajout a").attr('href', url).css({"display" : "flex", "justify-content" : "center"});
                    button.html('Ajouter ' + table);
                    statDataTable.generateDatatable($("#adminTab"), response[0], response[1], 0, 'asc');
                }
                else {
                    console.log('erreur de table')
                }
            },
            error: function (jqXHR, exception) {
                responseFail.displayFailure(jqXHR, exception);
            }
        })
    }   
}