import { Metadata } from "next";
import SharePageClient from "./SharePageClient";

interface Props {
  params: Promise<{ weekEnd: string; topicId: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://financelab.ai";

const TOPIC_LABELS: Record<string, string> = {
  cyber: "Cyber Risk",
  macro: "Macro",
  oil: "Oil",
  regulatory: "Crypto Regulatory",
  crypto: "Crypto ETF",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { weekEnd, topicId } = await params;
  const label = TOPIC_LABELS[topicId] || topicId;
  const title = `${label} — Weekly Highlights · Week ending ${weekEnd}`;
  const description = `Significant ${label.toLowerCase()} developments for the week ending ${weekEnd}, curated by FinanceLab monitoring agents.`;
  const ogImageUrl = `${SITE_URL}/api/og/weekly/${weekEnd}/${topicId}`;
  const pageUrl = `${SITE_URL}/share/weekly/${weekEnd}/${topicId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: pageUrl,
      siteName: "FinanceLab",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { weekEnd, topicId } = await params;
  return <SharePageClient weekEnd={weekEnd} topicId={topicId} />;
}