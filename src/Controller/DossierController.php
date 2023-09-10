<?php
declare(strict_types = 1);
namespace App\Controller;

use App\Repository\AgentCausalRepository;
use App\Repository\AssureRepository;
use App\Repository\CourrierRepository;
use App\Repository\DemandeRepository;
use App\Repository\RaisonClotureRepository;
use App\Repository\RefCourrierRepository;
use App\Service\pgService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DossierController extends AbstractController
{

    public function index(DemandeRepository $demandeRepo, CourrierRepository $courrierRepo, RefCourrierRepository $refCourrierRepo, RaisonClotureRepository $raisonClotureRepo, pgService $pgService): Response
    {
        $demandes = $demandeRepo->syntheseDossier();
        $raisonCloture = $raisonClotureRepo->findAll();
        $dossierassure = [];

        foreach ($demandes as $key => $demande) {

            $courrier = $courrierRepo->findLastCourrier($demande['matricule'], $demande['agent_causal']);

            $refCourrier = ($courrier) ? $refCourrierRepo->findOneBy(['reference' => $courrier[0]['ref']]) : "";

            $date = ($courrier) ? $courrier[0]['date_envoi'] : "";

            $dateEnvoi = ($date) ? date('d/m/Y', strtotime($date)) : "";

            $dateDemande = ($demande['date_demande']) ? date('d/m/Y', strtotime($demande['date_demande'])) : "";
            $dossierassure[] = [
                'statut' => $demande['statut'],
                'matricule' => $demande['matricule'],
                'nom' => $demande['nom'],
                'nomMarital' => $demande['nom_marital'],
                'prenom' => $demande['prenom'],
                'dateDemande' => $dateDemande,
                'agentCausal' => $demande['libelle'],
                'codeCausal' => $demande['agent_causal']
            ];
        }

        return $this->render('index.html.twig', [
            'dossiers' => $dossierassure,
            'raisonCloture' => $raisonCloture
        ]);
    }
    //[...]

    public function dossierStatut(Request $request, AssureRepository $assureRepo, DemandeRepository $demandeRepo, AgentCausalRepository $agentCausalRepo, CourrierRepository $courrierRepo, RefCourrierRepository $refCourrierRepo)
    {
        $statut = $request->get('statut');

        $demandes = $demandeRepo->syntheseDossier($statut);
        $dossiers = $this->rechercheDossier($demandes, $assureRepo, $agentCausalRepo, $courrierRepo, $refCourrierRepo);

        if (empty($dossiers)) {
            return new JsonResponse('erreur_dossier');
        }
        return new JsonResponse($dossiers);
    }

    public function dossierClos(Request $request, AssureRepository $assureRepo, DemandeRepository $demandeRepo, AgentCausalRepository $agentCausalRepo, CourrierRepository $courrierRepo, RefCourrierRepository $refCourrierRepo): Response
    {
        $raison = $request->get('raison');

        $demandes = $demandeRepo->findByReason($raison);
        $dossierClos = $this->rechercheDossier($demandes, $assureRepo, $agentCausalRepo, $courrierRepo, $refCourrierRepo);

        if (empty($dossierClos)) {
            return new JsonResponse('erreur_dossier');
        }
        // On retourne ensuite le résultat de rechercheDossier sous format json
        return new JsonResponse($dossierClos);
    }

}
