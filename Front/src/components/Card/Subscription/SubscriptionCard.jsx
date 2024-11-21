import { Fragment } from "react";
import Card from "../Card";
import Badge from "../../Badge/Badge";
import Button from "../../Button/Button";

const SubscriptionCard = ({ subscription, onSelect }) => {
    // Fonction pour formater le prix
    const formatPrice = (price) => {
        const formattedPrice = parseFloat(price).toFixed(2);
        const [euros, cents] = formattedPrice.split('.');
        return { euros, cents };
    };

    // Formater le prix de l'abonnement
    const { euros, cents } = formatPrice(subscription.price || "0");

    // Convertir la chaîne de fonctionnalités en liste
    const featureList = (subscription.features || "").split('\n').filter((feature) => feature);

    return (
        <Fragment>
            <Card title={""} css="w-auto min-h-[400px]">
                {subscription.name === "Basic" && (
                    <Badge color="success" css="absolute text-white fw-black -translate-x-10 -translate-y-10 text-md font-bold p-3">
                        Best Offer !
                    </Badge>
                )}

                <div className="flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold">
                            <span className="text-4xl">{euros}</span>
                            <span className="text-2xl">,{cents} € </span>
                            - <span className="text-secondary">{subscription.name}</span> Subscription
                        </h2>
                        <div className="flex flex-col mt-2">
                            <ul className="text-lg list-disc list-inside">
                                {featureList.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                                <li className="text-sm">And more...</li>
                            </ul>
                        </div>
                    </div>
                    <Button color="success" css="mt-10" onClick={() => onSelect(subscription)}>
                        Subscribe here
                    </Button>
                </div>
            </Card>
        </Fragment>
    );
};

export default SubscriptionCard;
