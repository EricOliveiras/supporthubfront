import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
}

export function AlertDialogDemo({open, onClose}: AlertDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Erro ao realizar Login!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Não foi possível realizar o login. Verifique suas credenciais e tente novamente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Fechar</AlertDialogCancel>
                    <AlertDialogAction onClick={onClose}>Tentar Novamente</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
