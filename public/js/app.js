$(document).ready(function () {

    const affichageDossier = new AffichageDossier();
    const courrier = new Courrier;
    const echeance = new Echeance;
    const demandePiece = new DemandePiece;
    const demandeForm = new DemandeForm;
    const rechercheAssure = new RechercheAssure;
    const dossierEdit = new DossierEdit;

    //Liste dossiers ouverts
    $("#dossier_open").click(function () {

        $('#raison_cloture_input').hide(); 
        $('#dossier_close').removeClass('btn-primary');
        $(this).addClass('btn-primary');
        affichageDossier.destroyDatatable( $("#dossierTab"));
        
        $.ajax({
            url: Routing.generate('app_dossiers_statut'),
            data:{'statut' : null},
            beforeSend: function () { $('#spinDossier').fadeIn(); },
            complete: function () { $('#spinDossier').fadeOut(), $},
            success: function(response){
                let dtColumns = ["statut", "matricule", "nom", "nom marital", "prenom"];
                affichageDossier.generateDossierDatatable($("#dossierTab"), response, dtColumns, 5)
                $('.titre-page h1').html("Consultation des dossiers ouverts");
            }
        })
    })

    //Liste dossiers clos
    $("#dossier_close").click(function () {

        $('#dossier_open').removeClass('btn-primary');
        $(this).addClass('btn-primary');
        affichageDossier.destroyDatatable( $("#dossierTab"));
        
        $.ajax({
            url: Routing.generate('app_dossiers_statut'),
            data:{'statut' : 'clos'},
            beforeSend: function () { $('#spinDossier').fadeIn(); },
            complete: function () { $('#spinDossier').fadeOut(), $('#raison_cloture_input').fadeIn(); },
            success: function(response){
                let dtColumns = ["statut", "matricule", "nom", "nom marital", "prenom", "date demande" ];
                affichageDossier.generateDossierDatatable($("#dossierTab"), response, dtColumns, 5)
                $('.titre-page h1').html("Consultation des dossiers clos");
            }
        })
    })

    //liste raisons clôture
    $('#raison_cloture').on('change', function () {

        affichageDossier.destroyDatatable($("#dossierTab"));
        affichageDossier.dossierPerRaisonCloture(affichageDossier.generateDossierDatatable);
    })

    //Champs complémentaires création courrier
    $('#libelle_refCourrier').on('change', function () {
        let courrierType = $(this).val();
        courrier.afficherChampsCourrier(courrierType);
    })

    $(".consultation_edit_bouton").click(dossierEdit.editerDossier);

    $('.conteneur_consultation_courrier').on('change', '#libelle_refCourrier', function () {
        courrier.rechercheCourrier();
    });

    $('.conteneur_consultation_courrier').on('click', '.bouton_courrier', function () {
        courrier.creerCourrier();
    })

    //Sauvegarde des modifications courrier
    $('.conteneur_consultation_courrier').on('click', '.courrier_save_action', function () {
        let idCourrier = $(this).attr('data-idCourrier');
        let refCourrier = $(this).attr('data-refCourrier');

        Swal.fire({
            title: 'Modifier le courrier ' + refCourrier + ' ?',
            text: "' envoi annulé ' mettra fin à toute échéance associée",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
        }).then((result) => {
            if (result.isConfirmed) {
                courrier.saveEditCourrier($(this), idCourrier);
                Swal.fire({
                    icon: 'success',
                    title: 'Courrier modifié !',
                });
            }
        })
    })

    //Création rappel échéance
    $('.subcont_echeance').on('click', '.bouton_rappel_creer', function () {
        let echeanceRow = $(this);
        let refCourrier = $(this).attr('data-refCourrier');
        let echeanceId = $(this).attr('data-echeanceId');
        let idCourrier = parseInt($(this).attr('data-idCourrier'));
        echeance.creerEcheance(refCourrier, echeanceRow, echeanceId, idCourrier, echeance.updateEcheanceNotification);
    });

    //Suppression echeance
    $('.subcont_echeance').on('click', '.delete_echeance', function (e) {
        
        e.preventDefault();

        let deleteButton = $(this);
        let echeanceRowParent = deleteButton.parents('.echeance_row');
        let echeanceRowCount = echeanceRowParent.parents('.bloc_echeance').children('.echeance_row');

        let refCourrier = $(this).attr('data-refCourrier');
        let idCourrier = $(this).attr('data-idCourrier');
        let idEcheance = $(this).attr('data-echeanceId');

        //Si l'échéance n'a plus de rappel, on retourne un message d'erreur
        if (echeanceRowCount.length === 1) {
            Swal.fire({
                icon: 'error',
                title: 'Suppression impossible!',
                text: 'Aucun rappel précédent pour cette échéance.',
            });
        }
        else {

            Swal.fire({
                title: "Supprimer l'échéance ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Oui',
                cancelButtonText: 'Non',
            }).then((result) => {
                if (result.isConfirmed) {
                    echeance.annulerEcheance(refCourrier, deleteButton, idCourrier, idEcheance, echeance.updateEcheanceNotification);
                }
            })
        }
    })


    //Bouton fin d'échéance
    $('.subcont_echeance').on('change', '.fin_echeance', function (e) {

        let boutonRappel = "";
        let date = $(this).val();

        if (date) {

            boutonRappel = $(this).parent().siblings('.bouton_rappel_creer');
            boutonRappel.removeClass('btn-success bouton_rappel_creer').addClass('btn-danger bouton_fin_echeance').html('Fin échéance');
        }
        else {

            boutonRappel = $(this).parent().siblings('.bouton_fin_echeance');
            boutonRappel.removeClass('btn-danger bouton_fin_echeance').addClass('btn-success bouton_rappel_creer').html('Créer un Rappel');
        }
    })

    //Fin échéance
    $('.bloc_echeance').on('click', '.bouton_fin_echeance', function () {

        let finEcheance = $("[name='fin_echeance']").val();
        echeance.terminerEcheance($(this), finEcheance, echeance.updateEcheanceNotification);
        
    });

    //Création pièce
    $('#bouton_piece_form').click(demandePiece.creerPiece);
    
    //suppression pièce
    $('.conteneur_consultation_pieces').on('click', '.bouton_piece_supprimer', function (e) {
        e.preventDefault();
        let idPiece = $(this).attr('data-piece');
        let pieceRow = $(this).parents('tr');

        Swal.fire({
            title: 'Supprimer la pièce ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
        }).then((result) => {
            if (result.isConfirmed) {
                demandePiece.supprimerPiece(idPiece, pieceRow);
            }
        })
    });
    
    $("#libelle_piece").on('change', function () {
        demandePiece.afficherchampsPiece();
    })

    $('.bouton_assure').click(function () {
        demandeForm.validationRecherche();
    });

    $('#nouvelle_demande').on('input', demandeForm.demandeFieldControl);
    $(".recherche_assure").on('input', rechercheAssure.rechercheAssureActive);
});