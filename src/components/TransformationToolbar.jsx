import React, { useState } from 'react';
import { 
    Sparkles, Scissors, Type, Calendar, Calculator, 
    ChevronDown, Eraser, Binary, Hash, ArrowRightLeft,
    MoreHorizontal, Regex, Split, Merge, EyeOff, Lock
} from 'lucide-react';
import { useI18n } from '../i18n/i18n.jsx';

export default function TransformationToolbar({ 
    activeCol, 
    actions 
}) {
    const [openMenu, setOpenMenu] = useState(null);
    const { t } = useI18n();

    const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);
    const closeMenu = () => setOpenMenu(null);

    const renderMenuItems = (id) => {
        switch(id) {
            case 'clean':
                return (
                    <>
                        <MenuItem icon={Eraser} label={t('studio.menu.smartClean')} onClick={() => actions.smartClean(activeCol)} closeMenu={closeMenu} />
                        <MenuItem icon={Scissors} label={t('studio.menu.trimSpaces')} onClick={() => actions.trimText(activeCol)} closeMenu={closeMenu} />
                        <MenuItem icon={Type} label={t('studio.menu.normalizeSpaces')} onClick={() => actions.normalizeSpaces(activeCol)} closeMenu={closeMenu} />
                        <div className="my-1 border-t border-gray-100 dark:border-wolf/10"></div>
                        <MenuItem icon={Binary} label={t('studio.menu.cleanSymbols')} onClick={() => actions.cleanSymbols(activeCol)} closeMenu={closeMenu} />
                        <MenuItem icon={Code} label={t('studio.menu.removeHtml')} onClick={() => actions.removeHtml(activeCol)} closeMenu={closeMenu} />
                        <MenuItem icon={Hash} label={t('studio.menu.onlyNumbers')} onClick={() => actions.removeNonNumeric(activeCol)} closeMenu={closeMenu} />
                        <MenuItem icon={Type} label={t('studio.menu.onlyLetters')} onClick={() => actions.removeNonAlpha(activeCol)} closeMenu={closeMenu} />
                    </>
                );
            case 'text':
                return (
                    <>
                        <MenuItem label={t('studio.menu.uppercase')} onClick={() => actions.handleCase(activeCol, 'upper')} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.lowercase')} onClick={() => actions.handleCase(activeCol, 'lower')} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.titleCase')} onClick={() => actions.handleCase(activeCol, 'title')} closeMenu={closeMenu} />
                        <div className="my-1 border-t border-gray-100 dark:border-wolf/10"></div>
                        <MenuItem label={t('studio.menu.textLength')} onClick={() => actions.addTextLength(activeCol)} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.reverseText')} onClick={() => actions.reverseText(activeCol)} closeMenu={closeMenu} />
                        <div className="my-1 border-t border-gray-100 dark:border-wolf/10"></div>
                        <MenuItem icon={ArrowRightLeft} label={t('studio.menu.replaceValue')} onClick={() => {
                            const find = prompt(t('studio.prompts.find'));
                            if(find) {
                                const rep = prompt(t('studio.prompts.replaceWith'));
                                if(rep !== null) actions.replaceValues(activeCol, find, rep);
                            }
                        }} closeMenu={closeMenu} />
                        <MenuItem icon={Regex} label={t('studio.menu.extractRegexSubstr')} onClick={() => {
                            const pat = prompt(t('studio.prompts.regexPattern'));
                            if(pat) actions.applyRegexExtract(activeCol, pat);
                        }} closeMenu={closeMenu} />
                    </>
                );
            case 'date':
                return (
                    <>
                        <MenuItem icon={Calendar} label={t('studio.menu.extractYear')} onClick={() => actions.extractDatePart(activeCol, 'year')} closeMenu={closeMenu} />
                        <MenuItem icon={Calendar} label={t('studio.menu.extractMonth')} onClick={() => actions.extractDatePart(activeCol, 'month')} closeMenu={closeMenu} />
                        <MenuItem icon={Calendar} label={t('studio.menu.dayOfWeek')} onClick={() => actions.getDayOfWeek(activeCol)} closeMenu={closeMenu} />
                        <MenuItem icon={Calendar} label={t('studio.menu.quarter')} onClick={() => actions.getQuarter(activeCol)} closeMenu={closeMenu} />
                        <div className="my-1 border-t border-gray-100 dark:border-wolf/10"></div>
                        <MenuItem label={t('studio.menu.addDays')} onClick={() => {
                            const d = prompt(t('studio.prompts.daysToAdd'), '0');
                            if(d) actions.addDaysToDate(activeCol, d);
                        }} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.addMonths')} onClick={() => {
                            const m = prompt(t('studio.prompts.monthsToAdd'), '0');
                            if(m) actions.addMonthsToDate(activeCol, m);
                        }} closeMenu={closeMenu} />
                    </>
                );
            case 'calc':
                return (
                    <>
                        <MenuItem icon={Calculator} label={t('studio.menu.round')} onClick={() => {
                            const d = prompt(t('studio.prompts.decimals'), '2');
                            if(d) actions.applyRound(activeCol, d);
                        }} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.absoluteValue')} onClick={() => actions.calcAdvanced(activeCol, 'ABS')} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.floor')} onClick={() => actions.calcAdvanced(activeCol, 'FLOOR')} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.ceil')} onClick={() => actions.calcAdvanced(activeCol, 'CEIL')} closeMenu={closeMenu} />
                        <div className="my-1 border-t border-gray-100 dark:border-wolf/10"></div>
                        <MenuItem label={t('studio.menu.sqrt')} onClick={() => actions.calcAdvanced(activeCol, 'SQRT')} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.log')} onClick={() => actions.calcAdvanced(activeCol, 'LOG')} closeMenu={closeMenu} />
                        <MenuItem label={t('studio.menu.power')} onClick={() => {
                            const p = prompt(t('studio.prompts.exponent'), '2');
                            if(p) actions.calcAdvanced(activeCol, 'POWER', p);
                        }} closeMenu={closeMenu} />
                         <MenuItem label={t('studio.menu.mod')} onClick={() => {
                            const m = prompt(t('studio.prompts.divisor'), '2');
                            if(m) actions.calcAdvanced(activeCol, 'MOD', m);
                        }} closeMenu={closeMenu} />
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto scrollbar-hide">
            <MenuButton icon={Sparkles} label={t('studio.top.cleaning')} menuId="clean" openMenu={openMenu} toggleMenu={toggleMenu} closeMenu={closeMenu} activeCol={activeCol} renderMenuItems={renderMenuItems} t={t} />
            <MenuButton icon={Type} label={t('studio.toolbar.text')} menuId="text" openMenu={openMenu} toggleMenu={toggleMenu} closeMenu={closeMenu} activeCol={activeCol} renderMenuItems={renderMenuItems} t={t} />
            <MenuButton icon={Calendar} label={t('studio.toolbar.date')} menuId="date" openMenu={openMenu} toggleMenu={toggleMenu} closeMenu={closeMenu} activeCol={activeCol} renderMenuItems={renderMenuItems} t={t} />
            <MenuButton icon={Calculator} label={t('studio.top.calc')} menuId="calc" openMenu={openMenu} toggleMenu={toggleMenu} closeMenu={closeMenu} activeCol={activeCol} renderMenuItems={renderMenuItems} t={t} />
            
            <div className="h-4 w-px bg-gray-200 dark:bg-wolf/10 mx-2"></div>
            
            <button 
                onClick={actions.removeDuplicates}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                title={t('studio.toolbar.removeDuplicatesTooltip')}
            >
                <EyeOff size={14} /> <span className="hidden lg:inline">{t('studio.toolbar.removeDuplicates')}</span>
            </button>
        </div>
    );
}

// Iconos que faltaban
function Code(props) { return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> }

function MenuItem(props) {
    const { label, onClick, icon: IconEl, danger, closeMenu } = props;
    return (
        <button 
            onClick={() => { onClick(); closeMenu(); }}
            className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-700 dark:text-gray-200'}`}
        >
            {IconEl && <IconEl size={14} className={danger ? 'text-red-500' : 'text-gray-400'} />}
            {label}
        </button>
    );
}

function MenuButton(props) {
    const { icon: IconEl, label, menuId, openMenu, toggleMenu, closeMenu, activeCol, renderMenuItems, t } = props;
    return (
        <div className="relative">
            <button 
                onClick={() => toggleMenu(menuId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${openMenu === menuId ? 'bg-persian/10 text-persian' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
                <IconEl size={14} />
                <span className="hidden md:inline">{label}</span>
                <ChevronDown size={12} className={`transition-transform ${openMenu === menuId ? 'rotate-180' : ''}`}/>
            </button>
            
            {openMenu === menuId && (
                <>
                    <div className="fixed inset-0 z-40" onClick={closeMenu}></div>
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-wolf/20 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {activeCol ? (
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-wolf/10 bg-gray-50 dark:bg-white/5">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">{t('studio.columnLabel')}: <span className="text-persian">{activeCol}</span></p>
                                </div>
                                {renderMenuItems(menuId)}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-400 text-xs">
                                <p>{t('studio.selectColumn')}</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
