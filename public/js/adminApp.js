$(document).ready(function () {

    const affichageTableauAdmin = new AffichageTableauAdmin;

    $(".bouton_table").click(function () {

        $(".bouton_table").css('backgroundColor', '#8b98a5')
        $(this).css('backgroundColor', '#3c8dbc')
        
        let table = $(this).attr("data-name");
        affichageTableauAdmin.genererTable(table);
    })

    if (sessionStorage.getItem("table")) {
        previousDatatable();
    }

    /**
     * Permet d'afficher automatiquement la liste d'une table si on revient de la page de détails / édition. 
     */
    function previousDatatable()
    {
        let tableName = sessionStorage.getItem("table");
        console.log(tableName);

        $(".bouton_table").css('backgroundColor', '#8b98a5')
        $('*[data-name= ' + tableName + ']').css('backgroundColor', '#3c8dbc');

        affichageTableauAdmin.genererTable(tableName);
        sessionStorage.clear();
    }

    $('.bouton_retour_liste').click(function () {
        sessionStorage.setItem("table", $(this).attr('data-table'));
    })

    $("#conteneur_admin_table").on('click', '.bouton_retour_liste', function(){
        sessionStorage.setItem("table", $(this).attr('data-table')); 
    })


    $("#conteneur_admin_table").on('click', '.bouton_suppression_admin', function(e){

        e.preventDefault();
        let itemTable = $(this).attr('data-table');
        let itemId = $(this).attr('data-idElement');

        Swal.fire({
            title: "Archiver l'élément ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
            }).then((result) => {
                if (result.isConfirmed) {
                    location.href = Routing.generate("admin_" + itemTable + "_delete", {'id' : itemId});
                }
            }
        )
    })
});