<?php

namespace App\Controller;

use App\Repository\DemandeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class StatistiquesController extends AbstractController
{ 
    public function index(): Response
    {
        $mess = "Page des statistiques";
        return $this->render('admin/statistiques/index.html.twig', [
            'mess' => $mess
        ]);
    }

    public function demandeCount(DemandeRepository $demandeRepo){
        $data = $demandeRepo->getDemandeCount();
        $countDossierEnCours = 0;

        foreach($data as $key => $tab){
            if($tab['statut'] === null || $tab['statut'] === ''){
                $countDossierEnCours += (int)$tab['nb'];
                unset($data[$key]);
            }
        }
        $totalDossierEnCours = ["nb" =>$countDossierEnCours, "statut" => "enc" ];
        $data[]= $totalDossierEnCours;
        $labelTab = ['Acceptées', 'Clôturées', 'Refusées', 'En cours'];
        $data += ["labelTab" => $labelTab];
        return new JsonResponse($data);
    }

    //[...]
}
