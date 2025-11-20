import { lazy } from 'react';
import { ViewModuleIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const result: IRouter[] = [
  {
    path: '/stone-manage',
    meta: {
      title: '石头管理',
      Icon: ViewModuleIcon,
    },
    children: [
      {
        path: 'stone-shapes',
        Component: lazy(() => import('pages/Stones/Shapes')),
        meta: { title: '石头形状表（stone_shapes）' },
      },
      {
        path: 'stone-colors',
        Component: lazy(() => import('pages/Stones/ColorGrades')),
        meta: { title: '石头颜色等级表（stone_color_grades）' },
      },
      {
        path: 'stone-clarities',
        Component: lazy(() => import('pages/Stones/ClarityGrades')),
        meta: { title: '石头净度等级表（stone_clarity_grades）' },
      },
      {
        path: 'stone-cuts',
        Component: lazy(() => import('pages/Stones/CutGrades')),
        meta: { title: '石头切工等级表（stone_cut_grades）' },
      },
      {
        path: 'stone-certificates',
        Component: lazy(() => import('pages/Stones/Certificates')),
        meta: { title: '石头证书机构表（stone_certificates）' },
      },
      {
        path: 'stones',
        Component: lazy(() => import('pages/List/Stones')),
        meta: { title: '石头表（stones）' },
      },
    ],
  },
  {
    path: '/product-manage',
    meta: {
      title: '产品管理',
      Icon: ViewModuleIcon,
    },
    children: [
      {
        path: 'product-categories',
        Component: lazy(() => import('pages/Products/Categories')),
        meta: { title: '产品类型表（product_categories）' },
      },
      {
        path: 'materials',
        Component: lazy(() => import('pages/Products/Materials')),
        meta: { title: '材料表（materials）' },
      },
      {
        path: 'products',
        Component: lazy(() => import('pages/Products/List')),
        meta: { title: '产品表（products）' },
      },
    ],
  },
];

export default result;
