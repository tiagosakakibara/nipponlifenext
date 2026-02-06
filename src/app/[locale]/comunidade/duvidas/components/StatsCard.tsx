import { Users, MessageSquare, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatsCardProps {
    membersCount: number;
    questionsCount: number;
    answersCount: number;
}

export function StatsCard({ membersCount, questionsCount, answersCount }: StatsCardProps) {
    const t = useTranslations();

    return (
        <div className="bg-gradient-to-br from-[#EAEAEA] to-[#f5f5f5] dark:from-gray-800 dark:to-gray-700 border border-app rounded-2xl p-8 shadow-sm h-full">
            <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-[#D70F24]/10 rounded-full flex items-center justify-center relative">
                    <Users className="w-8 h-8 text-[#D70F24]" />
                    <span className="absolute -bottom-1 -right-1 bg-[#D70F24] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {membersCount}
                    </span>
                </div>
                <div className="w-16 h-16 bg-[#003768]/10 rounded-full flex items-center justify-center relative">
                    <MessageSquare className="w-8 h-8 text-[#003768]" />
                    <span className="absolute -bottom-1 -right-1 bg-[#003768] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {questionsCount}
                    </span>
                </div>
                <div className="w-16 h-16 bg-[#5593C3]/10 rounded-full flex items-center justify-center relative">
                    <HelpCircle className="w-8 h-8 text-[#5593C3]" />
                    <span className="absolute -bottom-1 -right-1 bg-[#5593C3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {answersCount}
                    </span>
                </div>
            </div>
            <p className="text-center text-secondary text-sm mt-6">
                {t('community.questions.statsHero', { defaultMessage: 'Participe da comunidade e ajude outros membros!' })}
            </p>
        </div>
    );
}
