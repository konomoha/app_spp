<?php
namespace App\Command;

use App\Repository\AgentsRepository;
use App\Repository\EcheanceRepository;
use App\Service\SendMailService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mailer\MailerInterface;

class SendMailCommand extends Command
{
    private $sendMailService;
    private $mailer;
    private $echeanceRepo;
    private $agentRepo;

    protected static $defaultName = 'app:mail:reminder';

    public function __construct(SendMailService $sendMailService, MailerInterface $mailer, EcheanceRepository $echeanceRepo, AgentsRepository $agentRepo) 
    {
        $this->sendMailService = $sendMailService;
        $this->mailer = $mailer;
        $this->echeanceRepo = $echeanceRepo;
        $this->agentRepo = $agentRepo;

        parent::__construct();
    }

    protected function configure()
    {
        $this->addOption('dry-run', null, InputOption::VALUE_NONE, 'Dry run')
        ->setDescription('Envoi un mail de rappel.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $mails = $this->sendMailService->sendReminder($this->mailer, $this->echeanceRepo, $this->agentRepo);

        $io->success('Mail envoyés', $mails);
        return 0;
    }
}