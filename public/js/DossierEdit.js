class DossierEdit
{
    /**
     * Permet d'afficher le formulaire de modification d'un dossier
     */
    editerDossier()
    {
        window.scrollTo(0, 0);
        const dossierForm = new DossierForm;

        $('.bouton_modalite').click(function(){
            $("#modalite_surveillance").val($('#modalite_agentCausal').text());
        })

        $('.titre-page h1').html("SPP - Modification de dossier");
        $("#dossier_show").fadeOut("fast");
        $('.conteneur_consultation_boutons').fadeOut("fast");
        $("#form_dossier_conteneur").fadeIn("fast");
        $('#form_dossier').on('input', dossierForm.dossierFieldControl);
    }
}